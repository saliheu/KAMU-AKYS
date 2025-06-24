const amqp = require('amqplib');
const { logger } = require('../utils/logger');

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Define queues
    await channel.assertQueue('waste-collection', { durable: true });
    await channel.assertQueue('notifications', { durable: true });
    await channel.assertQueue('reports', { durable: true });
    
    logger.info('RabbitMQ connection established');
    
    connection.on('error', (err) => {
      logger.error('RabbitMQ connection error:', err);
    });
    
    connection.on('close', () => {
      logger.info('RabbitMQ connection closed, reconnecting...');
      setTimeout(connectRabbitMQ, 5000);
    });
    
    return channel;
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ:', error);
    setTimeout(connectRabbitMQ, 5000);
  }
};

const getChannel = () => channel;

const publishMessage = async (queue, message) => {
  try {
    if (!channel) {
      await connectRabbitMQ();
    }
    
    const messageBuffer = Buffer.from(JSON.stringify(message));
    return channel.sendToQueue(queue, messageBuffer, { persistent: true });
  } catch (error) {
    logger.error('Failed to publish message:', error);
    throw error;
  }
};

module.exports = {
  connectRabbitMQ,
  getChannel,
  publishMessage
};