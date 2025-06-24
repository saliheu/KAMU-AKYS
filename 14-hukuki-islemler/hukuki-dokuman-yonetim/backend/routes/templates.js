const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { Template, Document } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/templates');
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
  limits: { fileSize: 10485760 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['doc', 'docx'];
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .doc and .docx files are allowed for templates'));
    }
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      isActive = true
    } = req.query;

    const where = { isActive: isActive === 'true' };
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } }
      ];
    }

    if (category) where.category = category;

    const templates = await Template.findAndCountAll({
      where,
      order: [['usage', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      templates: templates.rows,
      total: templates.count,
      page: parseInt(page),
      totalPages: Math.ceil(templates.count / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching templates', error: error.message });
  }
});

router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Template.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      where: { isActive: true }
    });

    res.json({ categories: categories.map(c => c.category) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const template = await Template.findByPk(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching template', error: error.message });
  }
});

router.post('/', auth, authorize('admin', 'lawyer'), upload.single('file'), async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      tags,
      variables
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Template file is required' });
    }

    const template = await Template.create({
      name,
      description,
      category,
      tags: tags ? JSON.parse(tags) : [],
      variables: variables ? JSON.parse(variables) : [],
      fileUrl: `/uploads/templates/${req.file.filename}`,
      fileName: req.file.originalname,
      createdBy: req.user.id
    });

    res.status(201).json({ template });
  } catch (error) {
    res.status(500).json({ message: 'Error creating template', error: error.message });
  }
});

router.put('/:id', auth, authorize('admin', 'lawyer'), upload.single('file'), async (req, res) => {
  try {
    const template = await Template.findByPk(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    if (template.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own templates' });
    }

    const {
      name,
      description,
      category,
      tags,
      variables,
      isActive
    } = req.body;

    template.name = name || template.name;
    template.description = description || template.description;
    template.category = category || template.category;
    template.tags = tags ? JSON.parse(tags) : template.tags;
    template.variables = variables ? JSON.parse(variables) : template.variables;
    template.isActive = isActive !== undefined ? isActive : template.isActive;

    if (req.file) {
      // Delete old file
      try {
        await fs.unlink(path.join(__dirname, '..', template.fileUrl));
      } catch (err) {
        console.error('Error deleting old template file:', err);
      }

      template.fileUrl = `/uploads/templates/${req.file.filename}`;
      template.fileName = req.file.originalname;
    }

    await template.save();

    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: 'Error updating template', error: error.message });
  }
});

router.post('/:id/generate', auth, async (req, res) => {
  try {
    const template = await Template.findByPk(req.params.id);

    if (!template || !template.isActive) {
      return res.status(404).json({ message: 'Template not found or inactive' });
    }

    const { data, title, description, category } = req.body;

    // Read template file
    const templatePath = path.join(__dirname, '..', template.fileUrl);
    const content = await fs.readFile(templatePath, 'binary');

    // Generate document from template
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true
    });

    doc.setData(data);
    doc.render();

    const buf = doc.getZip().generate({ type: 'nodebuffer' });

    // Save generated document
    const outputFileName = `generated-${Date.now()}.docx`;
    const outputPath = path.join(__dirname, '../uploads/documents', outputFileName);
    await fs.writeFile(outputPath, buf);

    // Create document record
    const document = await Document.create({
      title: title || `Generated from ${template.name}`,
      description: description || template.description,
      category: category || 'other',
      fileUrl: `/uploads/documents/${outputFileName}`,
      fileName: outputFileName,
      fileSize: buf.length,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      createdBy: req.user.id,
      metadata: {
        generatedFromTemplate: template.id,
        templateName: template.name,
        generationData: data
      }
    });

    // Increment template usage
    template.usage += 1;
    await template.save();

    res.json({ 
      message: 'Document generated successfully',
      document 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating document', error: error.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const template = await Template.findByPk(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    template.isActive = false;
    await template.save();

    res.json({ message: 'Template deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting template', error: error.message });
  }
});

module.exports = router;