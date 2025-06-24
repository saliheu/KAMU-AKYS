const express = require('express');
const router = express.Router();
const { Document, User } = require('../models');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');

router.get('/', auth, async (req, res) => {
  try {
    const {
      q,
      type = 'all',
      category,
      dateFrom,
      dateTo,
      status,
      tags,
      page = 1,
      limit = 20
    } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const esClient = req.app.get('esClient');

    // Build Elasticsearch query
    const esQuery = {
      bool: {
        must: [
          {
            multi_match: {
              query: q,
              fields: ['title^3', 'description^2', 'content', 'tags'],
              type: 'best_fields',
              fuzziness: 'AUTO'
            }
          }
        ],
        filter: []
      }
    };

    if (category) {
      esQuery.bool.filter.push({ term: { category } });
    }

    if (status) {
      esQuery.bool.filter.push({ term: { status } });
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      esQuery.bool.filter.push({ terms: { tags: tagArray } });
    }

    if (dateFrom || dateTo) {
      const dateRange = { range: { createdAt: {} } };
      if (dateFrom) dateRange.range.createdAt.gte = dateFrom;
      if (dateTo) dateRange.range.createdAt.lte = dateTo;
      esQuery.bool.filter.push(dateRange);
    }

    try {
      // Search in Elasticsearch
      const esResults = await esClient.search({
        index: 'documents',
        body: {
          query: esQuery,
          highlight: {
            fields: {
              title: {},
              description: {},
              content: { fragment_size: 150 }
            }
          },
          from: (page - 1) * limit,
          size: limit
        }
      });

      const documentIds = esResults.hits.hits.map(hit => hit._source.id);
      const highlights = esResults.hits.hits.reduce((acc, hit) => {
        acc[hit._source.id] = hit.highlight;
        return acc;
      }, {});

      // Fetch full documents from database
      const documents = await Document.findAll({
        where: { id: documentIds },
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
        ]
      });

      // Add highlights to documents
      const documentsWithHighlights = documents.map(doc => ({
        ...doc.toJSON(),
        _highlights: highlights[doc.id] || {}
      }));

      res.json({
        results: documentsWithHighlights,
        total: esResults.hits.total.value,
        page: parseInt(page),
        totalPages: Math.ceil(esResults.hits.total.value / limit)
      });
    } catch (esError) {
      console.error('Elasticsearch error, falling back to database search:', esError);

      // Fallback to database search
      const where = {
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
          { fullTextContent: { [Op.iLike]: `%${q}%` } },
          { tags: { [Op.contains]: [q] } }
        ]
      };

      if (category) where.category = category;
      if (status) where.status = status;
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt[Op.gte] = dateFrom;
        if (dateTo) where.createdAt[Op.lte] = dateTo;
      }

      const documents = await Document.findAndCountAll({
        where,
        include: [
          { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      res.json({
        results: documents.rows,
        total: documents.count,
        page: parseInt(page),
        totalPages: Math.ceil(documents.count / parseInt(limit)),
        searchMethod: 'database'
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error searching documents', error: error.message });
  }
});

router.get('/suggestions', auth, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const esClient = req.app.get('esClient');

    try {
      const suggestions = await esClient.search({
        index: 'documents',
        body: {
          suggest: {
            title_suggest: {
              text: q,
              completion: {
                field: 'title.suggest',
                size: 5
              }
            },
            tag_suggest: {
              text: q,
              term: {
                field: 'tags',
                size: 5
              }
            }
          }
        }
      });

      const titleSuggestions = suggestions.suggest.title_suggest[0].options.map(opt => ({
        text: opt.text,
        type: 'title'
      }));

      const tagSuggestions = suggestions.suggest.tag_suggest[0].options.map(opt => ({
        text: opt.text,
        type: 'tag'
      }));

      res.json({ 
        suggestions: [...titleSuggestions, ...tagSuggestions] 
      });
    } catch (esError) {
      // Fallback to database suggestions
      const titleSuggestions = await Document.findAll({
        where: {
          title: { [Op.iLike]: `${q}%` }
        },
        attributes: ['title'],
        limit: 5,
        group: ['title']
      });

      const tagResults = await Document.findAll({
        where: {
          tags: { [Op.contains]: [q] }
        },
        attributes: ['tags'],
        limit: 5
      });

      const uniqueTags = [...new Set(tagResults.flatMap(doc => doc.tags))]
        .filter(tag => tag.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 5);

      res.json({
        suggestions: [
          ...titleSuggestions.map(doc => ({ text: doc.title, type: 'title' })),
          ...uniqueTags.map(tag => ({ text: tag, type: 'tag' }))
        ]
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suggestions', error: error.message });
  }
});

router.get('/advanced', auth, async (req, res) => {
  try {
    const filters = req.body;
    const where = {};
    const include = [
      { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
    ];

    // Title filter
    if (filters.title) {
      where.title = { [Op.iLike]: `%${filters.title}%` };
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      where.category = { [Op.in]: filters.categories };
    }

    // Status filter
    if (filters.statuses && filters.statuses.length > 0) {
      where.status = { [Op.in]: filters.statuses };
    }

    // Date range filter
    if (filters.dateRange) {
      where.createdAt = {};
      if (filters.dateRange.from) {
        where.createdAt[Op.gte] = new Date(filters.dateRange.from);
      }
      if (filters.dateRange.to) {
        where.createdAt[Op.lte] = new Date(filters.dateRange.to);
      }
    }

    // File size filter
    if (filters.fileSize) {
      where.fileSize = {};
      if (filters.fileSize.min) {
        where.fileSize[Op.gte] = filters.fileSize.min;
      }
      if (filters.fileSize.max) {
        where.fileSize[Op.lte] = filters.fileSize.max;
      }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      where.tags = { [Op.overlap]: filters.tags };
    }

    // Creator filter
    if (filters.createdBy && filters.createdBy.length > 0) {
      where.createdBy = { [Op.in]: filters.createdBy };
    }

    // Confidentiality level filter
    if (filters.confidentialityLevels && filters.confidentialityLevels.length > 0) {
      where.confidentialityLevel = { [Op.in]: filters.confidentialityLevels };
    }

    // Digital signature filter
    if (filters.hasDigitalSignature !== undefined) {
      if (filters.hasDigitalSignature) {
        where.digitallySignedBy = { [Op.ne]: [] };
      } else {
        where.digitallySignedBy = [];
      }
    }

    const documents = await Document.findAndCountAll({
      where,
      include,
      order: [[filters.sortBy || 'createdAt', filters.sortOrder || 'DESC']],
      limit: parseInt(filters.limit || 20),
      offset: (parseInt(filters.page || 1) - 1) * parseInt(filters.limit || 20)
    });

    res.json({
      results: documents.rows,
      total: documents.count,
      page: parseInt(filters.page || 1),
      totalPages: Math.ceil(documents.count / parseInt(filters.limit || 20))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error performing advanced search', error: error.message });
  }
});

module.exports = router;