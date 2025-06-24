const router = require('express').Router();
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { Book, Author, Category, Publisher, Review, Borrowing } = require('../models');
const { auth, optionalAuth, authorize, checkMembership } = require('../middleware/auth');
const { cache } = require('../config/redis');
const { search } = require('../config/elasticsearch');
const { Op } = require('sequelize');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

// File upload configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads', file.fieldname);
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'cover') {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Sadece resim dosyaları yüklenebilir'));
      }
    } else if (file.fieldname === 'file') {
      const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || ['pdf', 'epub', 'mobi', 'txt', 'doc', 'docx'];
      const extname = allowedTypes.includes(path.extname(file.originalname).toLowerCase().slice(1));
      
      if (extname) {
        return cb(null, true);
      } else {
        cb(new Error('Desteklenmeyen dosya formatı'));
      }
    }
  }
});

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all books
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search: searchQuery,
      categoryId,
      authorId,
      publisherId,
      language,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      available
    } = req.query;

    const cacheKey = `books:${JSON.stringify(req.query)}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

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

    // Filters
    if (searchQuery) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${searchQuery}%` } },
        { description: { [Op.iLike]: `%${searchQuery}%` } },
        { isbn: { [Op.iLike]: `%${searchQuery}%` } }
      ];
    }

    if (categoryId) {
      include[1].where = { id: categoryId };
    }

    if (authorId) {
      include[0].where = { id: authorId };
    }

    if (publisherId) {
      where.publisher_id = publisherId;
    }

    if (language) {
      where.language = language;
    }

    if (available !== undefined) {
      where.availableCopies = available === 'true' ? { [Op.gt]: 0 } : 0;
    }

    const offset = (page - 1) * limit;

    const { rows: books, count } = await Book.findAndCountAll({
      where,
      include,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    const result = {
      books,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    };

    await cache.set(cacheKey, result, 300); // Cache for 5 minutes

    res.json(result);
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ error: 'Kitaplar alınamadı' });
  }
});

// Get single book
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `book:${id}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json({ book: cached });
    }

    const book = await Book.findByPk(id, {
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
        },
        {
          model: Review,
          as: 'reviews',
          where: { status: 'approved' },
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'surname']
            }
          ],
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!book) {
      return res.status(404).json({ error: 'Kitap bulunamadı' });
    }

    // Increment view count
    await book.increment('viewCount');

    // Get related books
    const relatedBooks = await Book.findAll({
      include: [
        {
          model: Category,
          as: 'categories',
          where: {
            id: {
              [Op.in]: book.categories.map(c => c.id)
            }
          },
          through: { attributes: [] }
        }
      ],
      where: {
        id: { [Op.ne]: book.id }
      },
      limit: 6,
      order: [['rating', 'DESC']]
    });

    const result = {
      ...book.toJSON(),
      relatedBooks
    };

    await cache.set(cacheKey, result, 600); // Cache for 10 minutes

    res.json({ book: result });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ error: 'Kitap bilgisi alınamadı' });
  }
});

// Create book (Admin/Librarian only)
router.post('/', 
  auth, 
  authorize('admin', 'librarian'),
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'file', maxCount: 1 }
  ]),
  [
    body('isbn').optional().isISBN(),
    body('title').trim().notEmpty(),
    body('description').optional().trim(),
    body('language').optional().isIn(['tr', 'en', 'de', 'fr', 'ar']),
    body('publishYear').optional().isInt({ min: 1000, max: new Date().getFullYear() + 1 }),
    body('pageCount').optional().isInt({ min: 1 }),
    body('totalCopies').optional().isInt({ min: 0 }),
    body('categoryIds').optional().isArray(),
    body('authorIds').optional().isArray(),
    body('publisherId').optional().isUUID(),
    body('tags').optional().isArray()
  ],
  validate,
  async (req, res) => {
    try {
      const bookData = req.body;
      
      // Handle file uploads
      if (req.files?.cover) {
        const coverFile = req.files.cover[0];
        // Resize and optimize cover image
        const optimizedPath = path.join(
          path.dirname(coverFile.path),
          `optimized-${coverFile.filename}`
        );
        
        await sharp(coverFile.path)
          .resize(400, 600, { fit: 'inside' })
          .jpeg({ quality: 80 })
          .toFile(optimizedPath);
          
        bookData.coverImage = `/uploads/cover/optimized-${coverFile.filename}`;
        
        // Delete original
        await fs.unlink(coverFile.path);
      }

      if (req.files?.file) {
        const bookFile = req.files.file[0];
        bookData.file = `/uploads/file/${bookFile.filename}`;
        bookData.fileType = path.extname(bookFile.originalname).slice(1).toLowerCase();
        bookData.fileSize = bookFile.size;

        // Extract text for search if PDF
        if (bookData.fileType === 'pdf') {
          try {
            const dataBuffer = await fs.readFile(bookFile.path);
            const pdfData = await pdfParse(dataBuffer);
            bookData.metadata = {
              ...bookData.metadata,
              extractedText: pdfData.text.slice(0, 5000) // First 5000 chars
            };
          } catch (error) {
            console.error('PDF parsing error:', error);
          }
        }
      }

      // Create book
      const book = await Book.create({
        ...bookData,
        availableCopies: bookData.totalCopies || 1
      });

      // Set associations
      if (bookData.categoryIds?.length) {
        await book.setCategories(bookData.categoryIds);
      }

      if (bookData.authorIds?.length) {
        await book.setAuthors(bookData.authorIds);
        
        // Update author book counts
        await Author.increment('bookCount', {
          where: { id: bookData.authorIds }
        });
      }

      if (bookData.publisherId) {
        await Publisher.increment('bookCount', {
          where: { id: bookData.publisherId }
        });
      }

      // Index in Elasticsearch
      const bookForIndex = await Book.findByPk(book.id, {
        include: ['authors', 'categories', 'publisher']
      });
      
      await search.indexBook({
        id: bookForIndex.id,
        title: bookForIndex.title,
        description: bookForIndex.description,
        content: bookForIndex.metadata?.extractedText,
        isbn: bookForIndex.isbn,
        language: bookForIndex.language,
        publishYear: bookForIndex.publishYear,
        pageCount: bookForIndex.pageCount,
        authors: bookForIndex.authors,
        categories: bookForIndex.categories,
        publisher: bookForIndex.publisher,
        tags: bookForIndex.tags,
        rating: bookForIndex.rating,
        reviewCount: bookForIndex.reviewCount,
        borrowCount: bookForIndex.borrowCount,
        available: bookForIndex.availableCopies > 0,
        createdAt: bookForIndex.createdAt,
        updatedAt: bookForIndex.updatedAt
      });

      // Clear cache
      await cache.invalidatePattern('books:*');

      res.status(201).json({ book: bookForIndex });
    } catch (error) {
      console.error('Create book error:', error);
      res.status(500).json({ error: 'Kitap oluşturulamadı' });
    }
  }
);

// Update book (Admin/Librarian only)
router.put('/:id',
  auth,
  authorize('admin', 'librarian'),
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'file', maxCount: 1 }
  ]),
  [
    body('isbn').optional().isISBN(),
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('language').optional().isIn(['tr', 'en', 'de', 'fr', 'ar']),
    body('publishYear').optional().isInt({ min: 1000, max: new Date().getFullYear() + 1 }),
    body('pageCount').optional().isInt({ min: 1 }),
    body('totalCopies').optional().isInt({ min: 0 })
  ],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const book = await Book.findByPk(id);
      if (!book) {
        return res.status(404).json({ error: 'Kitap bulunamadı' });
      }

      // Handle file uploads
      if (req.files?.cover) {
        // Delete old cover if exists
        if (book.coverImage) {
          const oldPath = path.join(__dirname, '..', book.coverImage);
          await fs.unlink(oldPath).catch(() => {});
        }

        const coverFile = req.files.cover[0];
        const optimizedPath = path.join(
          path.dirname(coverFile.path),
          `optimized-${coverFile.filename}`
        );
        
        await sharp(coverFile.path)
          .resize(400, 600, { fit: 'inside' })
          .jpeg({ quality: 80 })
          .toFile(optimizedPath);
          
        updates.coverImage = `/uploads/cover/optimized-${coverFile.filename}`;
        await fs.unlink(coverFile.path);
      }

      if (req.files?.file) {
        // Delete old file if exists
        if (book.file) {
          const oldPath = path.join(__dirname, '..', book.file);
          await fs.unlink(oldPath).catch(() => {});
        }

        const bookFile = req.files.file[0];
        updates.file = `/uploads/file/${bookFile.filename}`;
        updates.fileType = path.extname(bookFile.originalname).slice(1).toLowerCase();
        updates.fileSize = bookFile.size;
      }

      await book.update(updates);

      // Update associations if provided
      if (updates.categoryIds !== undefined) {
        await book.setCategories(updates.categoryIds);
      }

      if (updates.authorIds !== undefined) {
        await book.setAuthors(updates.authorIds);
      }

      // Update Elasticsearch
      const updatedBook = await Book.findByPk(id, {
        include: ['authors', 'categories', 'publisher']
      });

      await search.updateBook(id, {
        title: updatedBook.title,
        description: updatedBook.description,
        authors: updatedBook.authors,
        categories: updatedBook.categories,
        publisher: updatedBook.publisher,
        available: updatedBook.availableCopies > 0
      });

      // Clear cache
      await cache.del(`book:${id}`);
      await cache.invalidatePattern('books:*');

      res.json({ book: updatedBook });
    } catch (error) {
      console.error('Update book error:', error);
      res.status(500).json({ error: 'Kitap güncellenemedi' });
    }
  }
);

// Delete book (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id, {
      include: ['borrowings']
    });

    if (!book) {
      return res.status(404).json({ error: 'Kitap bulunamadı' });
    }

    // Check if book has active borrowings
    const activeBorrowings = book.borrowings.filter(b => b.status === 'active');
    if (activeBorrowings.length > 0) {
      return res.status(400).json({ 
        error: 'Ödünç alınmış kitap silinemez',
        activeBorrowings: activeBorrowings.length
      });
    }

    // Delete files
    if (book.coverImage) {
      const coverPath = path.join(__dirname, '..', book.coverImage);
      await fs.unlink(coverPath).catch(() => {});
    }

    if (book.file) {
      const filePath = path.join(__dirname, '..', book.file);
      await fs.unlink(filePath).catch(() => {});
    }

    // Soft delete
    await book.destroy();

    // Remove from Elasticsearch
    await search.deleteBook(id);

    // Clear cache
    await cache.del(`book:${id}`);
    await cache.invalidatePattern('books:*');

    res.json({ message: 'Kitap silindi' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ error: 'Kitap silinemedi' });
  }
});

// Download book file
router.get('/:id/download', auth, checkMembership, async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({ error: 'Kitap bulunamadı' });
    }

    if (!book.file) {
      return res.status(404).json({ error: 'Kitap dosyası mevcut değil' });
    }

    if (!book.isDigital || !book.allowDownload) {
      return res.status(403).json({ error: 'Bu kitap indirilemez' });
    }

    // Check access level
    if (book.accessLevel === 'premium' && req.user.membershipType !== 'premium') {
      return res.status(403).json({ 
        error: 'Bu kitabı indirmek için premium üyelik gerekli' 
      });
    }

    // Record download
    await book.increment('downloadCount');

    const filePath = path.join(__dirname, '..', book.file);
    const fileName = `${book.title}.${book.fileType}`;

    res.download(filePath, fileName);
  } catch (error) {
    console.error('Download book error:', error);
    res.status(500).json({ error: 'Kitap indirilemedi' });
  }
});

// Get book reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, sortBy = 'createdAt' } = req.query;

    const offset = (page - 1) * limit;

    const { rows: reviews, count } = await Review.findAndCountAll({
      where: {
        bookId: id,
        status: 'approved'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'surname']
        }
      ],
      order: [[sortBy, 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      reviews,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Yorumlar alınamadı' });
  }
});

module.exports = router;