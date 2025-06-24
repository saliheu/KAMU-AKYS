const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;
const { Document, Version, User, Share } = require('../models');
const { auth, checkDocumentAccess } = require('../middleware/auth');
const { Op } = require('sequelize');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/documents');
    await fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 52428800 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,xls,xlsx,txt,rtf,odt').split(',');
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const calculateChecksum = async (filePath) => {
  const fileBuffer = await fs.readFile(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
};

const extractTextContent = async (filePath, mimeType) => {
  try {
    if (mimeType === 'application/pdf') {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (mimeType === 'text/plain') {
      return await fs.readFile(filePath, 'utf8');
    }
    return '';
  } catch (error) {
    console.error('Error extracting text:', error);
    return '';
  }
};

router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } }
      ];
    }

    if (category) where.category = category;
    if (status) where.status = status;

    const documents = await Document.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: Share, as: 'shares', where: { sharedWith: req.user.id }, required: false }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      documents: documents.rows,
      total: documents.count,
      page: parseInt(page),
      totalPages: Math.ceil(documents.count / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

router.get('/:id', auth, checkDocumentAccess, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: Version, as: 'versions', order: [['versionNumber', 'DESC']] },
        { model: Share, as: 'shares' }
      ]
    });

    res.json({ document });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error: error.message });
  }
});

router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      tags,
      validFrom,
      validUntil,
      confidentialityLevel,
      signatureRequiredBy
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const checksum = await calculateChecksum(req.file.path);
    const fullTextContent = await extractTextContent(req.file.path, req.file.mimetype);

    const document = await Document.create({
      title,
      description,
      category,
      tags: tags ? JSON.parse(tags) : [],
      validFrom,
      validUntil,
      confidentialityLevel,
      signatureRequiredBy: signatureRequiredBy ? JSON.parse(signatureRequiredBy) : [],
      fileUrl: `/uploads/documents/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      checksum,
      fullTextContent,
      createdBy: req.user.id
    });

    await Version.create({
      documentId: document.id,
      versionNumber: 1,
      fileUrl: document.fileUrl,
      fileName: document.fileName,
      fileSize: document.fileSize,
      checksum,
      changes: 'Initial version',
      changeType: 'major',
      createdBy: req.user.id
    });

    const esClient = req.app.get('esClient');
    await esClient.index({
      index: 'documents',
      body: {
        id: document.id,
        title: document.title,
        description: document.description,
        content: fullTextContent,
        category: document.category,
        tags: document.tags,
        createdBy: req.user.id,
        createdAt: document.createdAt
      }
    });

    const io = req.app.get('io');
    io.emit('document-created', {
      document,
      creator: req.user.name
    });

    res.status(201).json({ document });
  } catch (error) {
    res.status(500).json({ message: 'Error creating document', error: error.message });
  }
});

router.put('/:id', auth, checkDocumentAccess, upload.single('file'), async (req, res) => {
  try {
    const document = req.document;
    const {
      title,
      description,
      category,
      tags,
      validFrom,
      validUntil,
      confidentialityLevel,
      status
    } = req.body;

    if (document.isLocked && document.lockedBy !== req.user.id) {
      return res.status(423).json({ message: 'Document is locked by another user' });
    }

    document.title = title || document.title;
    document.description = description || document.description;
    document.category = category || document.category;
    document.tags = tags ? JSON.parse(tags) : document.tags;
    document.validFrom = validFrom || document.validFrom;
    document.validUntil = validUntil || document.validUntil;
    document.confidentialityLevel = confidentialityLevel || document.confidentialityLevel;
    document.status = status || document.status;

    if (req.file) {
      const checksum = await calculateChecksum(req.file.path);
      const fullTextContent = await extractTextContent(req.file.path, req.file.mimetype);

      document.currentVersion += 1;
      document.fileUrl = `/uploads/documents/${req.file.filename}`;
      document.fileName = req.file.originalname;
      document.fileSize = req.file.size;
      document.mimeType = req.file.mimetype;
      document.checksum = checksum;
      document.fullTextContent = fullTextContent;

      await Version.create({
        documentId: document.id,
        versionNumber: document.currentVersion,
        fileUrl: document.fileUrl,
        fileName: document.fileName,
        fileSize: document.fileSize,
        checksum,
        changes: req.body.changes || 'Updated document',
        changeType: req.body.changeType || 'minor',
        createdBy: req.user.id
      });

      const esClient = req.app.get('esClient');
      await esClient.update({
        index: 'documents',
        id: document.id,
        body: {
          doc: {
            title: document.title,
            description: document.description,
            content: fullTextContent,
            category: document.category,
            tags: document.tags,
            updatedAt: new Date()
          }
        }
      });
    }

    await document.save();

    const io = req.app.get('io');
    io.to(`document-${document.id}`).emit('document-updated', {
      document,
      updatedBy: req.user.name
    });

    res.json({ document });
  } catch (error) {
    res.status(500).json({ message: 'Error updating document', error: error.message });
  }
});

router.post('/:id/lock', auth, checkDocumentAccess, async (req, res) => {
  try {
    const document = req.document;

    if (document.isLocked) {
      return res.status(423).json({ 
        message: 'Document is already locked',
        lockedBy: document.lockedBy,
        lockedAt: document.lockedAt
      });
    }

    document.isLocked = true;
    document.lockedBy = req.user.id;
    document.lockedAt = new Date();
    await document.save();

    const io = req.app.get('io');
    io.to(`document-${document.id}`).emit('document-locked', {
      documentId: document.id,
      lockedBy: req.user.name
    });

    res.json({ message: 'Document locked successfully', document });
  } catch (error) {
    res.status(500).json({ message: 'Error locking document', error: error.message });
  }
});

router.post('/:id/unlock', auth, checkDocumentAccess, async (req, res) => {
  try {
    const document = req.document;

    if (!document.isLocked) {
      return res.status(400).json({ message: 'Document is not locked' });
    }

    if (document.lockedBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the user who locked the document can unlock it' });
    }

    document.isLocked = false;
    document.lockedBy = null;
    document.lockedAt = null;
    await document.save();

    const io = req.app.get('io');
    io.to(`document-${document.id}`).emit('document-unlocked', {
      documentId: document.id,
      unlockedBy: req.user.name
    });

    res.json({ message: 'Document unlocked successfully', document });
  } catch (error) {
    res.status(500).json({ message: 'Error unlocking document', error: error.message });
  }
});

router.delete('/:id', auth, checkDocumentAccess, async (req, res) => {
  try {
    const document = req.document;

    if (document.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the creator or admin can delete this document' });
    }

    if (document.isLocked) {
      return res.status(423).json({ message: 'Cannot delete a locked document' });
    }

    document.status = 'archived';
    await document.save();

    const esClient = req.app.get('esClient');
    await esClient.delete({
      index: 'documents',
      id: document.id
    });

    res.json({ message: 'Document archived successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
});

module.exports = router;