const router = require('express').Router();
const { query, validationResult } = require('express-validator');
const { search } = require('../config/elasticsearch');
const { Book, Author, Category } = require('../models');
const { Op } = require('sequelize');
const { cache } = require('../config/redis');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Full-text search
router.get('/', [
  query('q').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('categoryId').optional().isUUID(),
  query('authorId').optional().isUUID(),
  query('language').optional().isIn(['tr', 'en', 'de', 'fr', 'ar']),
  query('publishYear.min').optional().isInt(),
  query('publishYear.max').optional().isInt(),
  query('available').optional().isBoolean(),
  query('sortBy').optional().isIn(['relevance', 'title', 'year', 'rating', 'popular'])
], validate, async (req, res) => {
  try {
    const {
      q: searchQuery,
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      sortOrder = 'desc',
      ...filters
    } = req.query;

    // Check cache
    const cacheKey = `search:${JSON.stringify(req.query)}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    // Search in Elasticsearch
    const searchResult = await search.searchBooks(searchQuery, filters, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    });

    // Get full book details from database
    const bookIds = searchResult.hits.map(hit => hit.id);
    
    const books = await Book.findAll({
      where: { id: bookIds },
      include: [
        {
          model: Author,
          as: 'authors',
          through: { attributes: [] }
        },
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] }
        },
        {
          model: Publisher,
          as: 'publisher'
        }
      ]
    });

    // Maintain search result order
    const bookMap = new Map(books.map(book => [book.id, book]));
    const orderedBooks = bookIds
      .map(id => bookMap.get(id))
      .filter(Boolean)
      .map((book, index) => ({
        ...book.toJSON(),
        _score: searchResult.hits[index]._score,
        highlights: searchResult.hits[index].highlights
      }));

    const result = {
      books: orderedBooks,
      pagination: {
        total: searchResult.total,
        page: parseInt(page),
        pages: Math.ceil(searchResult.total / limit),
        limit: parseInt(limit)
      },
      facets: await getFacets(searchQuery, filters)
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, result, 300);

    res.json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Arama işlemi başarısız' });
  }
});

// Search suggestions
router.get('/suggest', [
  query('q').notEmpty().trim().isLength({ min: 2 })
], validate, async (req, res) => {
  try {
    const { q: searchQuery } = req.query;

    // Check cache
    const cacheKey = `suggest:${searchQuery}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json({ suggestions: cached });
    }

    // Get suggestions from Elasticsearch
    const suggestions = await search.suggest(searchQuery);

    // Also search in database for authors and categories
    const [authors, categories] = await Promise.all([
      Author.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `${searchQuery}%` } },
            { surname: { [Op.iLike]: `${searchQuery}%` } }
          ]
        },
        limit: 5,
        attributes: ['id', 'name', 'surname']
      }),
      Category.findAll({
        where: {
          name: { [Op.iLike]: `${searchQuery}%` }
        },
        limit: 5,
        attributes: ['id', 'name', 'slug']
      })
    ]);

    const result = [
      ...suggestions.map(s => ({
        type: 'book',
        text: s.text,
        id: s._id
      })),
      ...authors.map(a => ({
        type: 'author',
        text: a.fullName,
        id: a.id
      })),
      ...categories.map(c => ({
        type: 'category',
        text: c.name,
        id: c.id
      }))
    ];

    // Cache for 1 hour
    await cache.set(cacheKey, result, 3600);

    res.json({ suggestions: result });
  } catch (error) {
    console.error('Suggest error:', error);
    res.status(500).json({ error: 'Öneri servisi başarısız' });
  }
});

// Advanced search
router.post('/advanced', [
  query('title').optional().trim(),
  query('authors').optional().trim(),
  query('isbn').optional().trim(),
  query('publisher').optional().trim(),
  query('keywords').optional().trim(),
  query('categoryIds').optional().isArray(),
  query('language').optional().isIn(['tr', 'en', 'de', 'fr', 'ar']),
  query('publishYearFrom').optional().isInt(),
  query('publishYearTo').optional().isInt(),
  query('pageCountMin').optional().isInt({ min: 1 }),
  query('pageCountMax').optional().isInt(),
  query('available').optional().isBoolean()
], validate, async (req, res) => {
  try {
    const filters = req.body;
    const where = {};
    const include = [
      {
        model: Author,
        as: 'authors',
        through: { attributes: [] }
      },
      {
        model: Category,
        as: 'categories',
        through: { attributes: [] }
      },
      {
        model: Publisher,
        as: 'publisher'
      }
    ];

    // Build where conditions
    if (filters.title) {
      where.title = { [Op.iLike]: `%${filters.title}%` };
    }

    if (filters.isbn) {
      where.isbn = { [Op.iLike]: `%${filters.isbn}%` };
    }

    if (filters.language) {
      where.language = filters.language;
    }

    if (filters.publishYearFrom || filters.publishYearTo) {
      where.publishYear = {};
      if (filters.publishYearFrom) {
        where.publishYear[Op.gte] = filters.publishYearFrom;
      }
      if (filters.publishYearTo) {
        where.publishYear[Op.lte] = filters.publishYearTo;
      }
    }

    if (filters.pageCountMin || filters.pageCountMax) {
      where.pageCount = {};
      if (filters.pageCountMin) {
        where.pageCount[Op.gte] = filters.pageCountMin;
      }
      if (filters.pageCountMax) {
        where.pageCount[Op.lte] = filters.pageCountMax;
      }
    }

    if (filters.available !== undefined) {
      where.availableCopies = filters.available ? { [Op.gt]: 0 } : 0;
    }

    if (filters.keywords) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.keywords}%` } },
        { description: { [Op.iLike]: `%${filters.keywords}%` } },
        { tags: { [Op.contains]: [filters.keywords] } }
      ];
    }

    // Handle associations
    if (filters.authors) {
      include[0].where = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${filters.authors}%` } },
          { surname: { [Op.iLike]: `%${filters.authors}%` } }
        ]
      };
    }

    if (filters.categoryIds?.length) {
      include[1].where = {
        id: filters.categoryIds
      };
    }

    if (filters.publisher) {
      include[2].where = {
        name: { [Op.iLike]: `%${filters.publisher}%` }
      };
    }

    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { rows: books, count } = await Book.findAndCountAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    res.json({
      books,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ error: 'Gelişmiş arama başarısız' });
  }
});

// Get search facets
async function getFacets(searchQuery, filters) {
  try {
    const baseWhere = searchQuery ? {
      [Op.or]: [
        { title: { [Op.iLike]: `%${searchQuery}%` } },
        { description: { [Op.iLike]: `%${searchQuery}%` } }
      ]
    } : {};

    const [categories, languages, yearRange] = await Promise.all([
      // Top categories
      Category.findAll({
        attributes: [
          'id',
          'name',
          [
            sequelize.literal(`(
              SELECT COUNT(DISTINCT bc.book_id)
              FROM book_categories bc
              INNER JOIN books b ON bc.book_id = b.id
              WHERE bc.category_id = "Category".id
              AND b.deleted_at IS NULL
              ${searchQuery ? `AND (b.title ILIKE '%${searchQuery}%' OR b.description ILIKE '%${searchQuery}%')` : ''}
            )`),
            'bookCount'
          ]
        ],
        having: sequelize.literal('COUNT(DISTINCT bc.book_id) > 0'),
        order: [[sequelize.literal('bookCount'), 'DESC']],
        limit: 10
      }),

      // Available languages
      Book.findAll({
        attributes: [
          'language',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: baseWhere,
        group: ['language'],
        order: [[sequelize.literal('count'), 'DESC']]
      }),

      // Year range
      Book.findOne({
        attributes: [
          [sequelize.fn('MIN', sequelize.col('publishYear')), 'minYear'],
          [sequelize.fn('MAX', sequelize.col('publishYear')), 'maxYear']
        ],
        where: baseWhere
      })
    ]);

    return {
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        count: parseInt(c.dataValues.bookCount)
      })),
      languages: languages.map(l => ({
        code: l.language,
        count: parseInt(l.dataValues.count)
      })),
      yearRange: {
        min: yearRange?.dataValues.minYear || 1900,
        max: yearRange?.dataValues.maxYear || new Date().getFullYear()
      }
    };
  } catch (error) {
    console.error('Get facets error:', error);
    return null;
  }
}

module.exports = router;