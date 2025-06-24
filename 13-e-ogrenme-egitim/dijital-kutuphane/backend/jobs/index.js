const cron = require('node-cron');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');
const { Borrowing, Reservation, User, Book } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

// Daily jobs - Run at 9:00 AM
const dailyJobs = cron.schedule('0 9 * * *', async () => {
  logger.info('Starting daily jobs');
  
  try {
    // Send due reminders and overdue notices
    await notificationService.sendDailyReminders();
    
    // Check and update overdue borrowings
    await updateOverdueBorrowings();
    
    // Check expired reservations
    await expireReservations();
    
    // Send membership expiry reminders
    await sendMembershipReminders();
    
    logger.info('Daily jobs completed');
  } catch (error) {
    logger.error('Daily jobs error:', error);
  }
}, {
  scheduled: false
});

// Hourly jobs
const hourlyJobs = cron.schedule('0 * * * *', async () => {
  logger.info('Starting hourly jobs');
  
  try {
    // Process reservation queue
    await processReservationQueue();
    
    // Clean up expired notifications
    await notificationService.cleanupExpiredNotifications();
    
    logger.info('Hourly jobs completed');
  } catch (error) {
    logger.error('Hourly jobs error:', error);
  }
}, {
  scheduled: false
});

// Weekly jobs - Run on Mondays at 10:00 AM
const weeklyJobs = cron.schedule('0 10 * * 1', async () => {
  logger.info('Starting weekly jobs');
  
  try {
    // Send weekly newsletter
    await sendWeeklyNewsletter();
    
    // Generate weekly reports
    await generateWeeklyReports();
    
    logger.info('Weekly jobs completed');
  } catch (error) {
    logger.error('Weekly jobs error:', error);
  }
}, {
  scheduled: false
});

// Job implementations
async function updateOverdueBorrowings() {
  const updated = await Borrowing.update(
    { status: 'overdue' },
    {
      where: {
        status: 'active',
        dueDate: { [Op.lt]: new Date() }
      }
    }
  );
  
  logger.info(`Updated ${updated[0]} borrowings to overdue status`);
}

async function expireReservations() {
  // Expire ready reservations past pickup deadline
  const expiredReady = await Reservation.update(
    { status: 'expired' },
    {
      where: {
        status: 'ready',
        pickupDeadline: { [Op.lt]: new Date() }
      }
    }
  );
  
  // Expire pending reservations past expiry date
  const expiredPending = await Reservation.update(
    { status: 'expired' },
    {
      where: {
        status: 'pending',
        expiryDate: { [Op.lt]: new Date() }
      }
    }
  );
  
  logger.info(`Expired ${expiredReady[0]} ready and ${expiredPending[0]} pending reservations`);
}

async function processReservationQueue() {
  // Find books that became available
  const availableBooks = await Book.findAll({
    where: {
      availableCopies: { [Op.gt]: 0 }
    },
    include: [
      {
        model: Reservation,
        as: 'reservations',
        where: { status: 'pending' },
        required: true,
        include: ['user']
      }
    ]
  });
  
  for (const book of availableBooks) {
    // Get the next reservation in queue
    const nextReservation = book.reservations
      .sort((a, b) => a.queuePosition - b.queuePosition)[0];
    
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
      
      // Update queue positions
      await Reservation.decrement('queuePosition', {
        where: {
          bookId: book.id,
          status: 'pending',
          queuePosition: { [Op.gt]: nextReservation.queuePosition }
        }
      });
    }
  }
}

async function sendMembershipReminders() {
  // Find users with expiring memberships
  const expiringUsers = await User.findAll({
    where: {
      status: 'active',
      membershipExpiry: {
        [Op.between]: [
          new Date(),
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        ]
      }
    }
  });
  
  for (const user of expiringUsers) {
    const daysUntilExpiry = Math.ceil(
      (new Date(user.membershipExpiry) - new Date()) / (1000 * 60 * 60 * 24)
    );
    
    // Send reminders at 30, 14, 7, and 1 day before expiry
    if ([30, 14, 7, 1].includes(daysUntilExpiry)) {
      await notificationService.sendMembershipExpiry(user, daysUntilExpiry);
    }
  }
  
  logger.info(`Sent membership reminders to ${expiringUsers.length} users`);
}

async function sendWeeklyNewsletter() {
  // Get users who opted in for newsletters
  const users = await User.findAll({
    where: {
      status: 'active',
      'preferences.emailNotifications': true
    }
  });
  
  // Get data for newsletter
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const [newBooks, popularBooks] = await Promise.all([
    Book.findAll({
      where: {
        createdAt: { [Op.gte]: oneWeekAgo }
      },
      include: ['authors'],
      limit: 10,
      order: [['createdAt', 'DESC']]
    }),
    Book.findAll({
      attributes: ['id', 'title', 'borrowCount'],
      order: [['borrowCount', 'DESC']],
      limit: 10
    })
  ]);
  
  const newsletterData = {
    newBooks,
    popularBooks,
    readingTip: getWeeklyReadingTip()
  };
  
  let sent = 0;
  for (const user of users) {
    try {
      await emailService.sendWeeklyNewsletter(user, newsletterData);
      sent++;
    } catch (error) {
      logger.error(`Failed to send newsletter to ${user.email}:`, error);
    }
  }
  
  logger.info(`Sent weekly newsletter to ${sent} users`);
}

async function generateWeeklyReports() {
  // Generate various reports
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const [
    newBorrowings,
    returnedBooks,
    newUsers,
    totalFines
  ] = await Promise.all([
    Borrowing.count({
      where: {
        createdAt: { [Op.gte]: oneWeekAgo }
      }
    }),
    Borrowing.count({
      where: {
        returnDate: { [Op.gte]: oneWeekAgo },
        status: 'returned'
      }
    }),
    User.count({
      where: {
        createdAt: { [Op.gte]: oneWeekAgo }
      }
    }),
    Borrowing.sum('fine', {
      where: {
        createdAt: { [Op.gte]: oneWeekAgo }
      }
    })
  ]);
  
  const report = {
    week: new Date().toISOString(),
    newBorrowings,
    returnedBooks,
    newUsers,
    totalFines: totalFines || 0
  };
  
  logger.info('Weekly report:', report);
  
  // TODO: Save report to database or send to admins
}

function getWeeklyReadingTip() {
  const tips = [
    'Kitap okurken not almak, okuduklarınızı daha iyi hatırlamanıza yardımcı olur.',
    'Günde en az 30 dakika kitap okumak, kelime dağarcığınızı genişletir.',
    'Farklı türlerde kitaplar okumak, farklı bakış açıları kazanmanızı sağlar.',
    'Okuduğunuz kitapları arkadaşlarınızla tartışmak, anlayışınızı derinleştirir.',
    'Sessiz ve rahat bir okuma ortamı, konsantrasyonunuzu artırır.'
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
}

// Start all scheduled jobs
function startScheduledJobs() {
  dailyJobs.start();
  hourlyJobs.start();
  weeklyJobs.start();
  
  logger.info('Scheduled jobs started');
}

// Stop all scheduled jobs
function stopScheduledJobs() {
  dailyJobs.stop();
  hourlyJobs.stop();
  weeklyJobs.stop();
  
  logger.info('Scheduled jobs stopped');
}

module.exports = startScheduledJobs;