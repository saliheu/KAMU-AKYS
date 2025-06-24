const router = require('express').Router();
const { body, query, validationResult } = require('express-validator');
const { Borrowing, Book, User, Notification } = require('../models');
const { auth, authorize, checkMembership } = require('../middleware/auth');
const { Op } = require('sequelize');
const { cache } = require('../config/redis');
const notificationService = require('../services/notificationService');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get user's borrowings
router.get('/my', auth, async (req, res) => {
  try {
    const { status = 'active', page = 1, limit = 20 } = req.query;

    const where = { userId: req.user.id };
    if (status !== 'all') {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { rows: borrowings, count } = await Borrowing.findAndCountAll({
      where,
      include: [
        {
          model: Book,
          as: 'book',
          include: ['authors', 'categories']
        }
      ],
      order: [['borrowDate', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      borrowings,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get my borrowings error:', error);
    res.status(500).json({ error: 'Ödünç alma geçmişi alınamadı' });
  }
});

// Get all borrowings (Admin/Librarian)
router.get('/', auth, authorize('admin', 'librarian'), async (req, res) => {
  try {
    const {
      status,
      userId,
      bookId,
      overdue,
      page = 1,
      limit = 20,
      sortBy = 'borrowDate',
      sortOrder = 'DESC'
    } = req.query;

    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (bookId) {
      where.bookId = bookId;
    }
    
    if (overdue === 'true') {
      where.status = 'active';
      where.dueDate = { [Op.lt]: new Date() };
    }

    const offset = (page - 1) * limit;

    const { rows: borrowings, count } = await Borrowing.findAndCountAll({
      where,
      include: [
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'isbn', 'coverImage']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'surname', 'email', 'membershipNumber']
        },
        {
          model: User,
          as: 'issuer',
          attributes: ['id', 'name', 'surname']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset
    });

    // Calculate overdue days for active borrowings
    const borrowingsWithOverdue = borrowings.map(borrowing => {
      const data = borrowing.toJSON();
      if (borrowing.status === 'active' && new Date(borrowing.dueDate) < new Date()) {
        data.overdueDays = Math.floor(
          (new Date() - new Date(borrowing.dueDate)) / (1000 * 60 * 60 * 24)
        );
        data.currentFine = Borrowing.calculateFine(borrowing.dueDate);
      }
      return data;
    });

    res.json({
      borrowings: borrowingsWithOverdue,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get borrowings error:', error);
    res.status(500).json({ error: 'Ödünç alma kayıtları alınamadı' });
  }
});

// Create borrowing (Librarian checkout)
router.post('/', auth, authorize('admin', 'librarian'), [
  body('userId').isUUID(),
  body('bookId').isUUID(),
  body('dueDate').optional().isISO8601(),
  body('notes').optional().trim()
], validate, async (req, res) => {
  try {
    const { userId, bookId, dueDate, notes } = req.body;

    // Check user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    if (user.status !== 'active') {
      return res.status(400).json({ error: 'Kullanıcı aktif değil' });
    }

    // Check membership
    if (user.membershipExpiry && new Date(user.membershipExpiry) < new Date()) {
      return res.status(400).json({ error: 'Kullanıcı üyeliği sona ermiş' });
    }

    // Check borrowing limit
    const activeBorrowings = await Borrowing.count({
      where: {
        userId,
        status: 'active'
      }
    });

    if (activeBorrowings >= user.borrowLimit) {
      return res.status(400).json({ 
        error: 'Ödünç alma limiti aşıldı',
        limit: user.borrowLimit,
        current: activeBorrowings
      });
    }

    // Check for unpaid fines
    const unpaidFines = await Borrowing.sum('fine', {
      where: {
        userId,
        finePaid: false,
        fine: { [Op.gt]: 0 }
      }
    });

    if (unpaidFines > 0) {
      return res.status(400).json({
        error: 'Ödenmemiş ceza borcu var',
        amount: unpaidFines
      });
    }

    // Check book availability
    const book = await Book.findByPk(bookId, {
      include: ['authors']
    });

    if (!book) {
      return res.status(404).json({ error: 'Kitap bulunamadı' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ error: 'Kitap mevcut değil' });
    }

    // Check if user already has this book
    const existingBorrowing = await Borrowing.findOne({
      where: {
        userId,
        bookId,
        status: 'active'
      }
    });

    if (existingBorrowing) {
      return res.status(400).json({ error: 'Bu kitap zaten kullanıcıda' });
    }

    // Calculate due date (default 14 days)
    const calculatedDueDate = dueDate 
      ? new Date(dueDate) 
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Create borrowing
    const borrowing = await Borrowing.create({
      userId,
      bookId,
      dueDate: calculatedDueDate,
      issuedBy: req.user.id,
      notes,
      status: 'active'
    });

    // Update book availability
    await book.decrement('availableCopies');
    await book.increment('borrowCount');

    // Update user borrow count
    await user.increment('currentBorrowCount');
    await user.increment('totalBorrowCount');

    // Cancel any active reservations for this book by this user
    await Reservation.update(
      { status: 'fulfilled' },
      {
        where: {
          userId,
          bookId,
          status: 'pending'
        }
      }
    );

    // Send notification
    await notificationService.sendBorrowingConfirmation(user, book, borrowing);

    // Clear cache
    await cache.invalidatePattern(`borrowings:user:${userId}:*`);

    const borrowingWithDetails = await Borrowing.findByPk(borrowing.id, {
      include: ['book', 'user', 'issuer']
    });

    res.status(201).json({ borrowing: borrowingWithDetails });
  } catch (error) {
    console.error('Create borrowing error:', error);
    res.status(500).json({ error: 'Ödünç verme işlemi başarısız' });
  }
});

// Renew borrowing
router.post('/:id/renew', auth, checkMembership, async (req, res) => {
  try {
    const { id } = req.params;

    const borrowing = await Borrowing.findByPk(id, {
      include: ['book', 'user']
    });

    if (!borrowing) {
      return res.status(404).json({ error: 'Ödünç alma kaydı bulunamadı' });
    }

    // Check ownership or librarian role
    if (borrowing.userId !== req.user.id && 
        !['admin', 'librarian'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    if (borrowing.status !== 'active') {
      return res.status(400).json({ error: 'Sadece aktif ödünçler yenilenebilir' });
    }

    // Check renewal limit
    if (borrowing.renewCount >= borrowing.maxRenewCount) {
      return res.status(400).json({ 
        error: 'Yenileme limiti aşıldı',
        maxRenewals: borrowing.maxRenewCount
      });
    }

    // Check if overdue
    if (new Date(borrowing.dueDate) < new Date()) {
      return res.status(400).json({ error: 'Süresi geçmiş kitaplar yenilenemez' });
    }

    // Check if book has reservations
    const pendingReservations = await Reservation.count({
      where: {
        bookId: borrowing.bookId,
        status: 'pending'
      }
    });

    if (pendingReservations > 0) {
      return res.status(400).json({ 
        error: 'Bu kitap için bekleyen rezervasyonlar var',
        reservations: pendingReservations
      });
    }

    // Extend due date by 14 days
    const newDueDate = new Date(borrowing.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 14);

    await borrowing.update({
      dueDate: newDueDate,
      renewCount: borrowing.renewCount + 1
    });

    // Send notification
    await notificationService.sendRenewalConfirmation(
      borrowing.user,
      borrowing.book,
      borrowing
    );

    res.json({ 
      borrowing,
      message: 'Ödünç süresi uzatıldı',
      newDueDate,
      remainingRenewals: borrowing.maxRenewCount - borrowing.renewCount - 1
    });
  } catch (error) {
    console.error('Renew borrowing error:', error);
    res.status(500).json({ error: 'Yenileme işlemi başarısız' });
  }
});

// Return book
router.post('/:id/return', auth, authorize('admin', 'librarian'), [
  body('condition').optional().isIn(['excellent', 'good', 'fair', 'poor', 'damaged']),
  body('notes').optional().trim()
], validate, async (req, res) => {
  try {
    const { id } = req.params;
    const { condition = 'good', notes } = req.body;

    const borrowing = await Borrowing.findByPk(id, {
      include: ['book', 'user']
    });

    if (!borrowing) {
      return res.status(404).json({ error: 'Ödünç alma kaydı bulunamadı' });
    }

    if (borrowing.status !== 'active') {
      return res.status(400).json({ error: 'Bu kitap zaten iade edilmiş' });
    }

    const returnDate = new Date();
    let fine = 0;

    // Calculate fine if overdue
    if (new Date(borrowing.dueDate) < returnDate) {
      fine = Borrowing.calculateFine(borrowing.dueDate, returnDate);
    }

    // Update borrowing
    await borrowing.update({
      status: 'returned',
      returnDate,
      returnedTo: req.user.id,
      fine,
      condition,
      notes: notes ? `${borrowing.notes || ''}\nİade notu: ${notes}` : borrowing.notes
    });

    // Update book availability
    const book = borrowing.book;
    await book.increment('availableCopies');

    // Update user borrow count
    await borrowing.user.decrement('currentBorrowCount');

    // Check for reservations and notify next user
    const nextReservation = await Reservation.findOne({
      where: {
        bookId: book.id,
        status: 'pending'
      },
      include: ['user'],
      order: [['queuePosition', 'ASC']]
    });

    if (nextReservation) {
      await nextReservation.update({
        status: 'ready',
        notificationDate: new Date(),
        pickupDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
      });

      await notificationService.sendReservationReady(
        nextReservation.user,
        book,
        nextReservation
      );
    }

    // Clear cache
    await cache.invalidatePattern(`borrowings:user:${borrowing.userId}:*`);

    res.json({
      borrowing,
      message: 'Kitap başarıyla iade edildi',
      fine: fine > 0 ? fine : undefined
    });
  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({ error: 'İade işlemi başarısız' });
  }
});

// Get borrowing statistics
router.get('/stats', auth, authorize('admin', 'librarian'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.borrowDate = {};
      if (startDate) {
        where.borrowDate[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.borrowDate[Op.lte] = new Date(endDate);
      }
    }

    const [
      totalBorrowings,
      activeBorrowings,
      overdueBorrowings,
      totalFines,
      unpaidFines,
      topBooks,
      topUsers
    ] = await Promise.all([
      // Total borrowings
      Borrowing.count({ where }),
      
      // Active borrowings
      Borrowing.count({
        where: { ...where, status: 'active' }
      }),
      
      // Overdue borrowings
      Borrowing.count({
        where: {
          ...where,
          status: 'active',
          dueDate: { [Op.lt]: new Date() }
        }
      }),
      
      // Total fines
      Borrowing.sum('fine', { where }),
      
      // Unpaid fines
      Borrowing.sum('fine', {
        where: { ...where, finePaid: false }
      }),
      
      // Top borrowed books
      Book.findAll({
        attributes: [
          'id',
          'title',
          'borrowCount'
        ],
        order: [['borrowCount', 'DESC']],
        limit: 10
      }),
      
      // Top borrowers
      User.findAll({
        attributes: [
          'id',
          'name',
          'surname',
          'totalBorrowCount'
        ],
        where: { totalBorrowCount: { [Op.gt]: 0 } },
        order: [['totalBorrowCount', 'DESC']],
        limit: 10
      })
    ]);

    res.json({
      summary: {
        totalBorrowings,
        activeBorrowings,
        overdueBorrowings,
        totalFines: totalFines || 0,
        unpaidFines: unpaidFines || 0
      },
      topBooks,
      topUsers
    });
  } catch (error) {
    console.error('Get borrowing stats error:', error);
    res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
});

module.exports = router;