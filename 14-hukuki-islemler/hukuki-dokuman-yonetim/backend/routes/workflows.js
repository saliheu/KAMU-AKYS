const express = require('express');
const router = express.Router();
const { Workflow, Document, User } = require('../models');
const { auth, checkDocumentAccess } = require('../middleware/auth');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/email');

router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      priority
    } = req.query;

    const where = {
      [Op.or]: [
        { initiatedBy: req.user.id },
        { steps: { [Op.contains]: [{ assignedTo: req.user.id }] } }
      ]
    };
    
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    const workflows = await Workflow.findAndCountAll({
      where,
      include: [
        { model: Document, as: 'document', attributes: ['id', 'title', 'category'] },
        { model: User, as: 'initiator', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      workflows: workflows.rows,
      total: workflows.count,
      page: parseInt(page),
      totalPages: Math.ceil(workflows.count / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workflows', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const workflow = await Workflow.findByPk(req.params.id, {
      include: [
        { model: Document, as: 'document' },
        { model: User, as: 'initiator', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    // Check if user has access
    const hasAccess = workflow.initiatedBy === req.user.id ||
      workflow.steps.some(step => step.assignedTo === req.user.id);

    if (!hasAccess && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have access to this workflow' });
    }

    res.json({ workflow });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workflow', error: error.message });
  }
});

router.post('/', auth, checkDocumentAccess, async (req, res) => {
  try {
    const {
      name,
      description,
      documentId,
      type,
      steps,
      deadline,
      priority
    } = req.body;

    const workflow = await Workflow.create({
      name,
      description,
      documentId,
      type,
      steps: steps.map((step, index) => ({
        ...step,
        stepNumber: index + 1,
        status: 'pending',
        startedAt: null,
        completedAt: null
      })),
      deadline,
      priority,
      initiatedBy: req.user.id,
      status: 'pending'
    });

    // Send notifications to first step assignees
    const firstStep = workflow.steps[0];
    if (firstStep && firstStep.assignedTo) {
      const assignee = await User.findByPk(firstStep.assignedTo);
      if (assignee && assignee.preferences?.notifications?.email) {
        await sendEmail({
          to: assignee.email,
          subject: `New Workflow Assignment: ${workflow.name}`,
          html: `
            <p>You have been assigned to a new workflow step.</p>
            <p><strong>Workflow:</strong> ${workflow.name}</p>
            <p><strong>Document:</strong> ${req.document.title}</p>
            <p><strong>Priority:</strong> ${workflow.priority}</p>
            <p><strong>Deadline:</strong> ${workflow.deadline || 'No deadline'}</p>
          `
        });
      }
    }

    // Update workflow status to in_progress
    workflow.status = 'in_progress';
    await workflow.save();

    const io = req.app.get('io');
    io.emit('workflow-created', {
      workflow,
      initiator: req.user.name
    });

    res.status(201).json({ workflow });
  } catch (error) {
    res.status(500).json({ message: 'Error creating workflow', error: error.message });
  }
});

router.post('/:id/advance', auth, async (req, res) => {
  try {
    const { action, comments, data } = req.body;
    const workflow = await Workflow.findByPk(req.params.id);

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    if (workflow.status !== 'in_progress') {
      return res.status(400).json({ message: 'Workflow is not in progress' });
    }

    const currentStep = workflow.steps[workflow.currentStep];
    if (!currentStep || currentStep.assignedTo !== req.user.id) {
      return res.status(403).json({ message: 'You are not assigned to the current step' });
    }

    // Update current step
    currentStep.status = action === 'approve' ? 'completed' : 'rejected';
    currentStep.completedAt = new Date();
    currentStep.completedBy = req.user.id;
    if (comments) {
      currentStep.comments = comments;
    }
    if (data) {
      currentStep.data = data;
    }

    // Add to workflow comments
    workflow.comments.push({
      stepNumber: workflow.currentStep + 1,
      action,
      comments,
      userId: req.user.id,
      userName: req.user.name,
      timestamp: new Date()
    });

    if (action === 'reject') {
      workflow.status = 'rejected';
      workflow.completedAt = new Date();
    } else if (workflow.currentStep === workflow.steps.length - 1) {
      // Last step completed
      workflow.status = 'completed';
      workflow.completedAt = new Date();

      // Update document status if approval workflow
      if (workflow.type === 'approval') {
        const document = await Document.findByPk(workflow.documentId);
        document.status = 'approved';
        await document.save();
      }
    } else {
      // Move to next step
      workflow.currentStep += 1;
      const nextStep = workflow.steps[workflow.currentStep];
      nextStep.startedAt = new Date();

      // Send notification to next assignee
      if (nextStep.assignedTo) {
        const assignee = await User.findByPk(nextStep.assignedTo);
        if (assignee && assignee.preferences?.notifications?.email) {
          await sendEmail({
            to: assignee.email,
            subject: `Workflow Step Assignment: ${workflow.name}`,
            html: `
              <p>You have been assigned to a workflow step.</p>
              <p><strong>Workflow:</strong> ${workflow.name}</p>
              <p><strong>Step:</strong> ${nextStep.name}</p>
              <p><strong>Previous Action:</strong> ${action}</p>
              ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}
            `
          });
        }
      }
    }

    workflow.steps = [...workflow.steps];
    await workflow.save();

    const io = req.app.get('io');
    io.emit('workflow-updated', {
      workflow,
      action,
      user: req.user.name
    });

    res.json({ workflow });
  } catch (error) {
    res.status(500).json({ message: 'Error advancing workflow', error: error.message });
  }
});

router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const workflow = await Workflow.findByPk(req.params.id);

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    if (workflow.initiatedBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the initiator or admin can cancel this workflow' });
    }

    if (['completed', 'cancelled'].includes(workflow.status)) {
      return res.status(400).json({ message: 'Workflow is already completed or cancelled' });
    }

    workflow.status = 'cancelled';
    workflow.completedAt = new Date();
    workflow.metadata = {
      ...workflow.metadata,
      cancelledBy: req.user.id,
      cancelReason: reason
    };

    await workflow.save();

    const io = req.app.get('io');
    io.emit('workflow-cancelled', {
      workflow,
      cancelledBy: req.user.name
    });

    res.json({ message: 'Workflow cancelled successfully', workflow });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling workflow', error: error.message });
  }
});

module.exports = router;