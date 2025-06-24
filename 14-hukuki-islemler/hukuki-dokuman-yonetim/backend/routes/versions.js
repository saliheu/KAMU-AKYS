const express = require('express');
const router = express.Router();
const { Version, Document, User } = require('../models');
const { auth, checkDocumentAccess } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;

router.get('/document/:documentId', auth, checkDocumentAccess, async (req, res) => {
  try {
    const versions = await Version.findAll({
      where: { documentId: req.params.documentId },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ],
      order: [['versionNumber', 'DESC']]
    });

    res.json({ versions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching versions', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const version = await Version.findByPk(req.params.id, {
      include: [
        { model: Document, as: 'document' },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    // Check document access
    req.params.id = version.documentId;
    await checkDocumentAccess(req, res, () => {});

    res.json({ version });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching version', error: error.message });
  }
});

router.post('/:id/restore', auth, async (req, res) => {
  try {
    const version = await Version.findByPk(req.params.id);

    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    const document = await Document.findByPk(version.documentId);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check document access
    req.document = document;
    const hasAccess = document.createdBy === req.user.id || req.user.role === 'admin';
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have permission to restore versions' });
    }

    // Create new version from current document state
    const currentVersion = await Version.create({
      documentId: document.id,
      versionNumber: document.currentVersion + 1,
      fileUrl: document.fileUrl,
      fileName: document.fileName,
      fileSize: document.fileSize,
      checksum: document.checksum,
      changes: `Restored from version ${version.versionNumber}`,
      changeType: 'revision',
      createdBy: req.user.id
    });

    // Update document with restored version
    document.currentVersion = currentVersion.versionNumber;
    document.fileUrl = version.fileUrl;
    document.fileName = version.fileName;
    document.fileSize = version.fileSize;
    document.checksum = version.checksum;
    await document.save();

    const io = req.app.get('io');
    io.to(`document-${document.id}`).emit('version-restored', {
      document,
      restoredVersion: version.versionNumber,
      restoredBy: req.user.name
    });

    res.json({ 
      message: 'Version restored successfully',
      document,
      newVersion: currentVersion
    });
  } catch (error) {
    res.status(500).json({ message: 'Error restoring version', error: error.message });
  }
});

router.get('/:id/compare/:compareId', auth, async (req, res) => {
  try {
    const version1 = await Version.findByPk(req.params.id);
    const version2 = await Version.findByPk(req.params.compareId);

    if (!version1 || !version2) {
      return res.status(404).json({ message: 'Version not found' });
    }

    if (version1.documentId !== version2.documentId) {
      return res.status(400).json({ message: 'Versions must be from the same document' });
    }

    // Check document access
    const document = await Document.findByPk(version1.documentId);
    req.document = document;
    const hasAccess = document.createdBy === req.user.id || 
      await Share.findOne({ where: { documentId: document.id, sharedWith: req.user.id } });
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this document' });
    }

    res.json({
      version1: {
        id: version1.id,
        versionNumber: version1.versionNumber,
        fileName: version1.fileName,
        fileSize: version1.fileSize,
        changes: version1.changes,
        createdAt: version1.createdAt
      },
      version2: {
        id: version2.id,
        versionNumber: version2.versionNumber,
        fileName: version2.fileName,
        fileSize: version2.fileSize,
        changes: version2.changes,
        createdAt: version2.createdAt
      },
      differences: {
        sizeChange: version2.fileSize - version1.fileSize,
        timeElapsed: new Date(version2.createdAt) - new Date(version1.createdAt)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error comparing versions', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const version = await Version.findByPk(req.params.id);

    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    const document = await Document.findByPk(version.documentId);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only admin can delete versions
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can delete versions' });
    }

    // Cannot delete current version
    if (version.versionNumber === document.currentVersion) {
      return res.status(400).json({ message: 'Cannot delete the current version' });
    }

    // Archive instead of delete
    version.isArchived = true;
    await version.save();

    res.json({ message: 'Version archived successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting version', error: error.message });
  }
});

module.exports = router;