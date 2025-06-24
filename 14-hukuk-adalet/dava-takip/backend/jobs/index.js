const cron = require('node-cron');
const { Op } = require('sequelize');
const { Hearing, Task, Case, User, Notification } = require('../models');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

// Send hearing reminders (runs every day at 9 AM)
const hearingReminderJob = cron.schedule('0 9 * * *', async () => {
  logger.info('Running hearing reminder job');
  
  try {
    const reminderDays = parseInt(process.env.NOTIFICATION_DAYS_BEFORE) || 3;
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + reminderDays);

    const upcomingHearings = await Hearing.findAll({
      where: {
        hearingDate: {
          [Op.between]: [new Date(), reminderDate]
        },
        status: 'scheduled',
        reminderSent: false
      },
      include: [
        {
          model: Case,
          as: 'case',
          include: [
            { model: User, as: 'assignedLawyer' },
            { model: User, as: 'teamMembers' },
            { model: Court, as: 'court' }
          ]
        }
      ]
    });

    for (const hearing of upcomingHearings) {
      // Send to assigned lawyer
      if (hearing.case.assignedLawyer) {
        await emailService.sendHearingReminder(hearing, hearing.case.assignedLawyer, hearing.case);
        await notificationService.createNotification({
          userId: hearing.case.assignedLawyer.id,
          type: 'hearing_reminder',
          title: 'Duruşma Hatırlatması',
          message: `${hearing.case.caseNumber} numaralı davanın duruşması ${hearing.hearingDate.toLocaleDateString('tr-TR')} tarihinde`,
          relatedId: hearing.id,
          relatedType: 'hearing',
          priority: 'high',
          channels: ['inApp', 'email']
        });
      }

      // Send to team members
      for (const member of hearing.case.teamMembers) {
        await emailService.sendHearingReminder(hearing, member, hearing.case);
        await notificationService.createNotification({
          userId: member.id,
          type: 'hearing_reminder',
          title: 'Duruşma Hatırlatması',
          message: `${hearing.case.caseNumber} numaralı davanın duruşması ${hearing.hearingDate.toLocaleDateString('tr-TR')} tarihinde`,
          relatedId: hearing.id,
          relatedType: 'hearing',
          priority: 'high',
          channels: ['inApp', 'email']
        });
      }

      hearing.reminderSent = true;
      hearing.reminderSentAt = new Date();
      await hearing.save();
    }

    logger.info(`Sent reminders for ${upcomingHearings.length} hearings`);
  } catch (error) {
    logger.error('Hearing reminder job error:', error);
  }
});

// Send task reminders (runs every day at 8 AM)
const taskReminderJob = cron.schedule('0 8 * * *', async () => {
  logger.info('Running task reminder job');
  
  try {
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 2);

    const upcomingTasks = await Task.findAll({
      where: {
        dueDate: {
          [Op.between]: [new Date(), reminderDate]
        },
        status: ['pending', 'in_progress'],
        reminderSent: false
      },
      include: [
        { model: User, as: 'assignee' },
        { model: Case, as: 'case' }
      ]
    });

    for (const task of upcomingTasks) {
      if (task.assignee) {
        await emailService.sendTaskReminder(task, task.assignee, task.case);
        await notificationService.createNotification({
          userId: task.assignee.id,
          type: 'task_assignment',
          title: 'Görev Hatırlatması',
          message: `"${task.title}" görevinin son tarihi yaklaşıyor`,
          relatedId: task.id,
          relatedType: 'task',
          priority: task.priority,
          channels: ['inApp', 'email']
        });

        task.reminderSent = true;
        task.reminderDate = new Date();
        await task.save();
      }
    }

    logger.info(`Sent reminders for ${upcomingTasks.length} tasks`);
  } catch (error) {
    logger.error('Task reminder job error:', error);
  }
});

// Check statute of limitations (runs every day at 7 AM)
const statuteCheckJob = cron.schedule('0 7 * * *', async () => {
  logger.info('Running statute of limitations check job');
  
  try {
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + 30); // Warn 30 days before

    const casesWithDeadline = await Case.findAll({
      where: {
        statuteOfLimitationsDate: {
          [Op.between]: [new Date(), warningDate]
        },
        status: { [Op.notIn]: ['closed', 'won', 'lost', 'settled'] }
      },
      include: [
        { model: User, as: 'assignedLawyer' },
        { model: User, as: 'teamMembers' }
      ]
    });

    for (const caseItem of casesWithDeadline) {
      const daysRemaining = Math.ceil((new Date(caseItem.statuteOfLimitationsDate) - new Date()) / (1000 * 60 * 60 * 24));
      const priority = daysRemaining <= 7 ? 'urgent' : 'high';

      // Notify assigned lawyer
      if (caseItem.assignedLawyer) {
        await emailService.sendDeadlineWarning(caseItem, caseItem.statuteOfLimitationsDate, caseItem.assignedLawyer);
        await notificationService.createNotification({
          userId: caseItem.assignedLawyer.id,
          type: 'statute_warning',
          title: 'Zamanaşımı Uyarısı',
          message: `${caseItem.caseNumber} numaralı davanın zamanaşımı süresi ${daysRemaining} gün içinde doluyor!`,
          relatedId: caseItem.id,
          relatedType: 'case',
          priority,
          channels: ['inApp', 'email']
        });
      }

      // Notify team members
      for (const member of caseItem.teamMembers) {
        await notificationService.createNotification({
          userId: member.id,
          type: 'statute_warning',
          title: 'Zamanaşımı Uyarısı',
          message: `${caseItem.caseNumber} numaralı davanın zamanaşımı süresi ${daysRemaining} gün içinde doluyor!`,
          relatedId: caseItem.id,
          relatedType: 'case',
          priority,
          channels: ['inApp']
        });
      }
    }

    logger.info(`Checked statute of limitations for ${casesWithDeadline.length} cases`);
  } catch (error) {
    logger.error('Statute check job error:', error);
  }
});

// Update overdue tasks (runs every day at midnight)
const overdueTasksJob = cron.schedule('0 0 * * *', async () => {
  logger.info('Running overdue tasks update job');
  
  try {
    const updated = await Task.update(
      { status: 'overdue' },
      {
        where: {
          dueDate: { [Op.lt]: new Date() },
          status: ['pending', 'in_progress']
        }
      }
    );

    logger.info(`Updated ${updated[0]} tasks to overdue status`);
  } catch (error) {
    logger.error('Overdue tasks job error:', error);
  }
});

// Clean up old notifications (runs every Sunday at 2 AM)
const cleanupJob = cron.schedule('0 2 * * 0', async () => {
  logger.info('Running cleanup job');
  
  try {
    const deleted = await notificationService.cleanupOldNotifications();
    logger.info(`Cleanup completed, deleted ${deleted} notifications`);
  } catch (error) {
    logger.error('Cleanup job error:', error);
  }
});

// Calculate and update case expenses (runs every day at 1 AM)
const expenseCalculationJob = cron.schedule('0 1 * * *', async () => {
  logger.info('Running expense calculation job');
  
  try {
    const cases = await Case.findAll({
      where: {
        status: { [Op.notIn]: ['closed', 'archived'] }
      }
    });

    for (const caseItem of cases) {
      if (caseItem.expenses && caseItem.expenses.length > 0) {
        const total = caseItem.expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
        if (total !== caseItem.totalExpenses) {
          caseItem.totalExpenses = total;
          await caseItem.save();
        }
      }
    }

    logger.info(`Updated expenses for ${cases.length} cases`);
  } catch (error) {
    logger.error('Expense calculation job error:', error);
  }
});

module.exports = () => {
  logger.info('Initializing cron jobs');
  
  // Start all jobs
  hearingReminderJob.start();
  taskReminderJob.start();
  statuteCheckJob.start();
  overdueTasksJob.start();
  cleanupJob.start();
  expenseCalculationJob.start();

  return {
    hearingReminderJob,
    taskReminderJob,
    statuteCheckJob,
    overdueTasksJob,
    cleanupJob,
    expenseCalculationJob
  };
};