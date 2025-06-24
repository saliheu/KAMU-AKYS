const { connectRabbitMQ, getChannel } = require('../config/rabbitmq');
const { logger } = require('../utils/logger');
const { processWasteCollection } = require('./wasteCollectionWorker');
const { processNotification } = require('./notificationWorker');
const { processReport } = require('./reportWorker');

const startWorkers = async () => {
  try {
    await connectRabbitMQ();
    const channel = getChannel();

    if (!channel) {
      throw new Error('RabbitMQ channel not available');
    }

    // Waste collection worker
    await channel.consume('waste-collection', async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          await processWasteCollection(data);
          channel.ack(msg);
        } catch (error) {
          logger.error('Waste collection worker error:', error);
          channel.nack(msg, false, false);
        }
      }
    });

    // Notification worker
    await channel.consume('notifications', async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          await processNotification(data);
          channel.ack(msg);
        } catch (error) {
          logger.error('Notification worker error:', error);
          channel.nack(msg, false, false);
        }
      }
    });

    // Report worker
    await channel.consume('reports', async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          await processReport(data);
          channel.ack(msg);
        } catch (error) {
          logger.error('Report worker error:', error);
          channel.nack(msg, false, false);
        }
      }
    });

    logger.info('All workers started successfully');
  } catch (error) {
    logger.error('Failed to start workers:', error);
    throw error;
  }
};

module.exports = { startWorkers };