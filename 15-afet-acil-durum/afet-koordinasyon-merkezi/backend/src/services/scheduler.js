const cron = require('node-cron');
const { addDataAggregationJob, addReportJob } = require('../workers');
const { Disaster, Report } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class Scheduler {
  constructor() {
    this.jobs = new Map();
  }

  start() {
    // Every 15 minutes: Aggregate active disaster statistics
    this.jobs.set('aggregate-stats', cron.schedule('*/15 * * * *', async () => {
      try {
        const activeDisasters = await Disaster.findAll({
          where: {
            status: ['active', 'controlled']
          }
        });

        for (const disaster of activeDisasters) {
          await addDataAggregationJob({
            type: 'disaster_statistics',
            disasterId: disaster.id,
            timeRange: '24h'
          });
        }
        
        logger.info(`Scheduled statistics aggregation for ${activeDisasters.length} disasters`);
      } catch (error) {
        logger.error('Statistics aggregation scheduling error:', error);
      }
    }));

    // Every hour: Update resource availability
    this.jobs.set('resource-availability', cron.schedule('0 * * * *', async () => {
      try {
        const activeDisasters = await Disaster.findAll({
          where: {
            status: ['active', 'controlled']
          }
        });

        for (const disaster of activeDisasters) {
          await addDataAggregationJob({
            type: 'resource_availability',
            disasterId: disaster.id
          });
        }
        
        logger.info('Scheduled resource availability updates');
      } catch (error) {
        logger.error('Resource availability scheduling error:', error);
      }
    }));

    // Every 30 minutes: Analyze help request trends
    this.jobs.set('help-trends', cron.schedule('*/30 * * * *', async () => {
      try {
        const activeDisasters = await Disaster.findAll({
          where: {
            status: 'active'
          }
        });

        for (const disaster of activeDisasters) {
          await addDataAggregationJob({
            type: 'help_request_trends',
            disasterId: disaster.id,
            timeRange: '24h'
          });
        }
        
        logger.info('Scheduled help request trend analysis');
      } catch (error) {
        logger.error('Help request trends scheduling error:', error);
      }
    }));

    // Daily at 6 AM: Generate daily reports
    this.jobs.set('daily-reports', cron.schedule('0 6 * * *', async () => {
      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeDisasters = await Disaster.findAll({
          where: {
            status: ['active', 'controlled'],
            startDate: { [Op.lte]: today }
          }
        });

        for (const disaster of activeDisasters) {
          const report = await Report.create({
            disasterId: disaster.id,
            type: 'daily',
            title: `${disaster.name} - Günlük Durum Raporu`,
            reportNumber: `DAILY-${disaster.id}-${yesterday.toISOString().split('T')[0]}`,
            period: {
              start: yesterday,
              end: today
            },
            generatedById: 'system', // System generated
            status: 'draft'
          });

          await addReportJob({
            reportId: report.id,
            formats: ['pdf', 'excel']
          });
        }
        
        logger.info(`Scheduled ${activeDisasters.length} daily reports`);
      } catch (error) {
        logger.error('Daily report scheduling error:', error);
      }
    }));

    // Weekly on Mondays at 9 AM: Generate weekly reports
    this.jobs.set('weekly-reports', cron.schedule('0 9 * * 1', async () => {
      try {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        lastWeek.setHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeDisasters = await Disaster.findAll({
          where: {
            status: ['active', 'controlled', 'recovery'],
            startDate: { [Op.lte]: today }
          }
        });

        for (const disaster of activeDisasters) {
          const report = await Report.create({
            disasterId: disaster.id,
            type: 'weekly',
            title: `${disaster.name} - Haftalık Durum Raporu`,
            reportNumber: `WEEKLY-${disaster.id}-${lastWeek.toISOString().split('T')[0]}`,
            period: {
              start: lastWeek,
              end: today
            },
            generatedById: 'system',
            status: 'draft'
          });

          await addReportJob({
            reportId: report.id,
            formats: ['pdf', 'excel']
          });
        }
        
        logger.info(`Scheduled ${activeDisasters.length} weekly reports`);
      } catch (error) {
        logger.error('Weekly report scheduling error:', error);
      }
    }));

    // Every 2 hours: Update location priorities
    this.jobs.set('location-priorities', cron.schedule('0 */2 * * *', async () => {
      try {
        const activeDisasters = await Disaster.findAll({
          where: {
            status: 'active'
          }
        });

        for (const disaster of activeDisasters) {
          await addDataAggregationJob({
            type: 'location_priorities',
            disasterId: disaster.id
          });
        }
        
        logger.info('Scheduled location priority updates');
      } catch (error) {
        logger.error('Location priority scheduling error:', error);
      }
    }));

    // Every hour: Team performance metrics
    this.jobs.set('team-performance', cron.schedule('0 * * * *', async () => {
      try {
        const activeDisasters = await Disaster.findAll({
          where: {
            status: 'active'
          }
        });

        for (const disaster of activeDisasters) {
          await addDataAggregationJob({
            type: 'team_performance',
            disasterId: disaster.id,
            timeRange: '24h'
          });
        }
        
        logger.info('Scheduled team performance updates');
      } catch (error) {
        logger.error('Team performance scheduling error:', error);
      }
    }));

    logger.info('Scheduler started with all jobs');
  }

  stop() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped scheduled job: ${name}`);
    });
    this.jobs.clear();
  }

  // Add a one-time scheduled job
  scheduleOnce(date, jobType, data) {
    const now = new Date();
    if (date <= now) {
      logger.warn('Scheduled date is in the past, executing immediately');
      return this.executeJob(jobType, data);
    }

    const delay = date - now;
    setTimeout(() => {
      this.executeJob(jobType, data);
    }, delay);

    logger.info(`Scheduled one-time job ${jobType} for ${date}`);
  }

  async executeJob(jobType, data) {
    try {
      switch (jobType) {
        case 'report':
          await addReportJob(data);
          break;
        case 'aggregation':
          await addDataAggregationJob(data);
          break;
        default:
          logger.warn(`Unknown job type: ${jobType}`);
      }
    } catch (error) {
      logger.error(`Error executing job ${jobType}:`, error);
    }
  }
}

module.exports = new Scheduler();