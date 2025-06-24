const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { Category, Book } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { cache } = require('../config/redis');
const { Op } = require('sequelize');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { 
      includeSubcategories = true,
      onlyActive = true,
      withBookCount = true 
    } = req.query;

    // Check cache
    const cacheKey = `categories:${JSON.stringify(req.query)}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json({ categories: cached });
    }

    const where = {};
    if (onlyActive === 'true') {
      where.isActive = true;
    }

    const include = [];
    if (includeSubcategories === 'true') {
      include.push({
        model: Category,
        as: 'subcategories',
        where: onlyActive === 'true' ? { isActive: true } : undefined,
        required: false
      });
    }

    // Get root categories
    const categories = await Category.findAll({
      where: {
        ...where,
        parentId: null
      },
      include,
      order: [
        ['order', 'ASC'],
        ['name', 'ASC']
      ]
    });

    // Calculate book counts if requested
    if (withBookCount === 'true') {
      const categoryIds = [];
      const collectIds = (cats) => {
        cats.forEach(cat => {
          categoryIds.push(cat.id);
          if (cat.subcategories) {
            collectIds(cat.subcategories);
          }
        });
      };
      collectIds(categories);

      // Get book counts
      const bookCounts = await sequelize.query(`
        SELECT 
          bc.category_id,
          COUNT(DISTINCT bc.book_id) as book_count
        FROM book_categories bc
        INNER JOIN books b ON bc.book_id = b.id
        WHERE 
          bc.category_id IN (:categoryIds)
          AND b.deleted_at IS NULL
        GROUP BY bc.category_id
      `, {
        replacements: { categoryIds },
        type: sequelize.QueryTypes.SELECT
      });

      const countMap = new Map(
        bookCounts.map(row => [row.category_id, parseInt(row.book_count)])
      );

      // Update categories with counts
      const updateCounts = (cats) => {
        return cats.map(cat => {
          const catData = cat.toJSON();
          catData.bookCount = countMap.get(cat.id) || 0;
          
          if (catData.subcategories) {
            catData.subcategories = updateCounts(catData.subcategories);
            // Sum subcategory counts
            catData.totalBookCount = catData.bookCount + 
              catData.subcategories.reduce((sum, sub) => sum + (sub.totalBookCount || sub.bookCount || 0), 0);
          } else {
            catData.totalBookCount = catData.bookCount;
          }
          
          return catData;
        });
      };

      const categoriesWithCounts = updateCounts(categories);
      
      // Cache for 1 hour
      await cache.set(cacheKey, categoriesWithCounts, 3600);
      
      return res.json({ categories: categoriesWithCounts });
    }

    // Cache for 1 hour
    await cache.set(cacheKey, categories, 3600);

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Kategoriler alınamadı' });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'parent'
        },
        {
          model: Category,
          as: 'subcategories',
          where: { isActive: true },
          required: false
        },
        {
          model: Book,
          as: 'books',
          through: { attributes: [] },
          attributes: ['id', 'title', 'coverImage', 'rating'],
          include: ['authors'],
          limit: 10,
          order: [['rating', 'DESC']]
        }
      ]
    });

    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Kategori bilgisi alınamadı' });
  }
});

// Create category (Admin only)
router.post('/', auth, authorize('admin'), [
  body('name').trim().notEmpty(),
  body('description').optional().trim(),
  body('parentId').optional().isUUID(),
  body('icon').optional().trim(),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('order').optional().isInt({ min: 0 })
], validate, async (req, res) => {
  try {
    const categoryData = req.body;

    // Check if parent exists
    if (categoryData.parentId) {
      const parent = await Category.findByPk(categoryData.parentId);
      if (!parent) {
        return res.status(400).json({ error: 'Üst kategori bulunamadı' });
      }
    }

    // Check if name already exists
    const existing = await Category.findOne({
      where: { name: categoryData.name }
    });

    if (existing) {
      return res.status(400).json({ error: 'Bu isimde bir kategori zaten mevcut' });
    }

    const category = await Category.create(categoryData);

    // Clear cache
    await cache.invalidatePattern('categories:*');

    res.status(201).json({ category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Kategori oluşturulamadı' });
  }
});

// Update category (Admin only)
router.put('/:id', auth, authorize('admin'), [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('parentId').optional().isUUID().nullable(),
  body('icon').optional().trim(),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('order').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean()
], validate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }

    // Check if changing parent would create circular reference
    if (updates.parentId && updates.parentId !== category.parentId) {
      const wouldCreateCircular = async (catId, parentId) => {
        if (catId === parentId) return true;
        
        const parent = await Category.findByPk(parentId);
        if (!parent || !parent.parentId) return false;
        
        return wouldCreateCircular(catId, parent.parentId);
      };

      if (await wouldCreateCircular(id, updates.parentId)) {
        return res.status(400).json({ error: 'Bu değişiklik döngüsel referans oluşturur' });
      }
    }

    await category.update(updates);

    // Clear cache
    await cache.invalidatePattern('categories:*');

    res.json({ category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Kategori güncellenemedi' });
  }
});

// Delete category (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'subcategories'
        },
        {
          model: Book,
          as: 'books',
          through: { attributes: [] }
        }
      ]
    });

    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }

    // Check if has subcategories
    if (category.subcategories.length > 0) {
      return res.status(400).json({ 
        error: 'Alt kategorileri olan kategori silinemez',
        subcategories: category.subcategories.length
      });
    }

    // Check if has books
    if (category.books.length > 0) {
      return res.status(400).json({ 
        error: 'Kitapları olan kategori silinemez',
        books: category.books.length
      });
    }

    await category.destroy();

    // Clear cache
    await cache.invalidatePattern('categories:*');

    res.json({ message: 'Kategori silindi' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Kategori silinemedi' });
  }
});

// Get category tree
router.get('/tree/all', async (req, res) => {
  try {
    const cacheKey = 'categories:tree';
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json({ tree: cached });
    }

    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['name', 'ASC']]
    });

    // Build tree structure
    const buildTree = (parentId = null) => {
      return categories
        .filter(cat => cat.parentId === parentId)
        .map(cat => ({
          ...cat.toJSON(),
          children: buildTree(cat.id)
        }));
    };

    const tree = buildTree();

    // Cache for 1 hour
    await cache.set(cacheKey, tree, 3600);

    res.json({ tree });
  } catch (error) {
    console.error('Get category tree error:', error);
    res.status(500).json({ error: 'Kategori ağacı alınamadı' });
  }
});

module.exports = router;