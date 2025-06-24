const { Workflow, Document, User } = require('../models');
const { Op } = require('sequelize');
const { sendWorkflowNotification } = require('../utils/email');

const checkWorkflowDeadlines = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    // Find workflows with approaching deadlines
    const urgentWorkflows = await Workflow.findAll({
      where: {
        status: 'in_progress',
        deadline: {
          [Op.between]: [new Date(), tomorrow]
        }
      },
      include: [
        { model: Document, as: 'document' }
      ]
    });

    for (const workflow of urgentWorkflows) {
      const currentStep = workflow.steps[workflow.currentStep];
      
      if (currentStep && currentStep.assignedTo) {
        const assignee = await User.findByPk(currentStep.assignedTo);
        
        if (assignee?.preferences?.notifications?.workflowDeadline) {
          await sendWorkflowNotification(
            assignee,
            workflow,
            workflow.document,
            'deadline'
          );
        }
      }

      // Update workflow priority if deadline is very close
      const hoursUntilDeadline = (new Date(workflow.deadline) - new Date()) / (1000 * 60 * 60);
      if (hoursUntilDeadline < 24 && workflow.priority !== 'urgent') {
        workflow.priority = 'urgent';
        await workflow.save();
      }
    }

    console.log(`Checked ${urgentWorkflows.length} workflows for deadlines`);
  } catch (error) {
    console.error('Error checking workflow deadlines:', error);
  }
};

const processStuckWorkflows = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find workflows that have been in the same step for too long
    const stuckWorkflows = await Workflow.findAll({
      where: {
        status: 'in_progress',
        updatedAt: { [Op.lt]: thirtyDaysAgo }
      }
    });

    for (const workflow of stuckWorkflows) {
      // Send reminder to current assignee
      const currentStep = workflow.steps[workflow.currentStep];
      
      if (currentStep && currentStep.assignedTo) {
        const assignee = await User.findByPk(currentStep.assignedTo);
        
        if (assignee) {
          await sendWorkflowNotification(
            assignee,
            workflow,
            await workflow.getDocument(),
            'reminder'
          );
        }
      }

      // Log for admin review
      console.log(`Workflow ${workflow.id} has been stuck for over 30 days`);
    }
  } catch (error) {
    console.error('Error processing stuck workflows:', error);
  }
};

const cleanupCompletedWorkflows = async () => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Archive old completed workflows
    const result = await Workflow.update(
      { 
        metadata: sequelize.fn(
          'jsonb_set',
          sequelize.col('metadata'),
          '{archived}',
          'true'
        )
      },
      {
        where: {
          status: { [Op.in]: ['completed', 'cancelled', 'rejected'] },
          completedAt: { [Op.lt]: ninetyDaysAgo }
        }
      }
    );

    console.log(`Archived ${result[0]} old workflows`);
  } catch (error) {
    console.error('Error cleaning up workflows:', error);
  }
};

module.exports = {
  checkWorkflowDeadlines,
  processStuckWorkflows,
  cleanupCompletedWorkflows
};