const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Share, Document, User } = require('../models');
const { auth, checkDocumentAccess } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');
const { Op } = require('sequelize');

router.get('/my-shares', auth, async (req, res) => {
  try {
    const { type = 'received' } = req.query;

    const where = type === 'received' 
      ? { sharedWith: req.user.id, isActive: true }
      : { sharedBy: req.user.id };

    const shares = await Share.findAll({
      where,
      include: [
        { model: Document, as: 'document', attributes: ['id', 'title', 'category', 'fileSize'] },
        { model: User, as: 'sharer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'recipient', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ shares });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shares', error: error.message });
  }
});

router.get('/link/:shareLink', async (req, res) => {
  try {
    const share = await Share.findOne({
      where: {
        shareLink: req.params.shareLink,
        shareType: 'link',
        isActive: true
      },
      include: [
        { model: Document, as: 'document' }
      ]
    });

    if (!share) {
      return res.status(404).json({ message: 'Share link not found or expired' });
    }

    // Check expiration
    if (share.expiresAt && new Date() > share.expiresAt) {
      share.isActive = false;
      await share.save();
      return res.status(410).json({ message: 'Share link has expired' });
    }

    // Check download limit
    if (share.maxDownloads && share.downloadCount >= share.maxDownloads) {
      share.isActive = false;
      await share.save();
      return res.status(410).json({ message: 'Download limit reached' });
    }

    res.json({
      share: {
        id: share.id,
        permissions: share.permissions,
        requiresPassword: !!share.password,
        document: {
          id: share.document.id,
          title: share.document.title,
          fileName: share.document.fileName,
          fileSize: share.document.fileSize,
          category: share.document.category
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching share', error: error.message });
  }
});

router.post('/link/:shareLink/access', async (req, res) => {
  try {
    const { password } = req.body;
    
    const share = await Share.findOne({
      where: {
        shareLink: req.params.shareLink,
        shareType: 'link',
        isActive: true
      },
      include: [
        { model: Document, as: 'document' }
      ]
    });

    if (!share) {
      return res.status(404).json({ message: 'Share link not found' });
    }

    // Verify password if required
    if (share.password) {
      if (!password || !await bcrypt.compare(password, share.password)) {
        return res.status(401).json({ message: 'Invalid password' });
      }
    }

    // Update access info
    share.downloadCount += 1;
    share.lastAccessedAt = new Date();
    await share.save();

    res.json({
      document: share.document,
      permissions: share.permissions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error accessing share', error: error.message });
  }
});

router.post('/', auth, checkDocumentAccess, async (req, res) => {
  try {
    const {
      documentId,
      shareType,
      sharedWith,
      permissions = ['view'],
      expiresAt,
      maxDownloads,
      password,
      notes
    } = req.body;

    const shareData = {
      documentId,
      sharedBy: req.user.id,
      shareType,
      permissions,
      expiresAt,
      maxDownloads,
      notes
    };

    if (shareType === 'user') {
      if (!sharedWith) {
        return res.status(400).json({ message: 'User ID required for user share' });
      }

      const recipient = await User.findByPk(sharedWith);
      if (!recipient) {
        return res.status(404).json({ message: 'Recipient user not found' });
      }

      shareData.sharedWith = sharedWith;

      // Send email notification
      if (recipient.preferences?.notifications?.email) {
        await sendEmail({
          to: recipient.email,
          subject: `Document Shared: ${req.document.title}`,
          html: `
            <p>${req.user.name} has shared a document with you.</p>
            <p><strong>Document:</strong> ${req.document.title}</p>
            <p><strong>Permissions:</strong> ${permissions.join(', ')}</p>
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
            ${expiresAt ? `<p><strong>Expires:</strong> ${new Date(expiresAt).toLocaleDateString()}</p>` : ''}
          `
        });
      }
    } else if (shareType === 'department') {
      if (!sharedWith) {
        return res.status(400).json({ message: 'Department required for department share' });
      }
      shareData.sharedWith = sharedWith;
    } else if (shareType === 'link') {
      // Generate unique share link
      shareData.shareLink = crypto.randomBytes(32).toString('hex');
      
      if (password) {
        shareData.password = await bcrypt.hash(password, 10);
      }
    }

    const share = await Share.create(shareData);

    const io = req.app.get('io');
    if (shareType === 'user') {
      io.to(`user-${sharedWith}`).emit('document-shared', {
        share,
        document: req.document,
        sharedBy: req.user.name
      });
    }

    res.status(201).json({ 
      share,
      ...(shareType === 'link' && { 
        shareUrl: `${process.env.FRONTEND_URL}/shared/${share.shareLink}` 
      })
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating share', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const share = await Share.findByPk(req.params.id);

    if (!share) {
      return res.status(404).json({ message: 'Share not found' });
    }

    if (share.sharedBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own shares' });
    }

    const {
      permissions,
      expiresAt,
      maxDownloads,
      notes,
      isActive
    } = req.body;

    share.permissions = permissions || share.permissions;
    share.expiresAt = expiresAt || share.expiresAt;
    share.maxDownloads = maxDownloads || share.maxDownloads;
    share.notes = notes || share.notes;
    if (isActive !== undefined) share.isActive = isActive;

    await share.save();

    res.json({ share });
  } catch (error) {
    res.status(500).json({ message: 'Error updating share', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const share = await Share.findByPk(req.params.id);

    if (!share) {
      return res.status(404).json({ message: 'Share not found' });
    }

    if (share.sharedBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only revoke your own shares' });
    }

    share.isActive = false;
    await share.save();

    res.json({ message: 'Share revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error revoking share', error: error.message });
  }
});

module.exports = router;