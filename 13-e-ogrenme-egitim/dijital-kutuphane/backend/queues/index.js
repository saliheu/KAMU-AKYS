const Queue = require('bull');
const logger = require('../utils/logger');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');
const { search } = require('../config/elasticsearch');
const { Book } = require('../models');

// Create queues
const fileProcessingQueue = new Queue('file-processing', {
  redis: {
    host: process.env.QUEUE_REDIS_HOST || process.env.REDIS_HOST,
    port: process.env.QUEUE_REDIS_PORT || process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  }
});

const emailQueue = new Queue('email', {
  redis: {
    host: process.env.QUEUE_REDIS_HOST || process.env.REDIS_HOST,
    port: process.env.QUEUE_REDIS_PORT || process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  }
});

const searchIndexQueue = new Queue('search-index', {
  redis: {
    host: process.env.QUEUE_REDIS_HOST || process.env.REDIS_HOST,
    port: process.env.QUEUE_REDIS_PORT || process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  }
});

// File processing jobs
fileProcessingQueue.process('extract-text', async (job) => {
  const { bookId, filePath } = job.data;
  
  logger.info(`Processing file for book ${bookId}`);
  
  try {
    const book = await Book.findByPk(bookId);
    if (!book) {
      throw new Error('Book not found');
    }
    
    const fullPath = path.join(__dirname, '..', filePath);
    const fileBuffer = await fs.readFile(fullPath);
    
    let extractedText = '';
    
    if (book.fileType === 'pdf') {
      const pdfData = await pdfParse(fileBuffer);
      extractedText = pdfData.text;
    } else if (['txt', 'doc', 'docx'].includes(book.fileType)) {
      // TODO: Implement text extraction for other formats
      extractedText = fileBuffer.toString('utf-8');
    }
    
    // Update book with extracted text
    await book.update({
      metadata: {
        ...book.metadata,
        extractedText: extractedText.slice(0, 50000), // Store first 50k chars
        textExtracted: true,
        textExtractionDate: new Date()
      }
    });
    
    // Queue for search indexing
    await searchIndexQueue.add('index-book', { bookId });
    
    logger.info(`Text extraction completed for book ${bookId}`);
    
    return { success: true, textLength: extractedText.length };
  } catch (error) {
    logger.error(`Text extraction failed for book ${bookId}:`, error);
    throw error;
  }
});

fileProcessingQueue.process('generate-thumbnail', async (job) => {
  const { bookId, coverPath } = job.data;
  
  logger.info(`Generating thumbnails for book ${bookId}`);
  
  try {
    const sharp = require('sharp');
    const fullPath = path.join(__dirname, '..', coverPath);
    const dir = path.dirname(fullPath);
    const filename = path.basename(fullPath);
    
    // Generate different sizes
    const sizes = [
      { name: 'thumb', width: 150, height: 225 },
      { name: 'small', width: 200, height: 300 },
      { name: 'medium', width: 400, height: 600 }
    ];
    
    for (const size of sizes) {
      const outputPath = path.join(dir, `${size.name}-${filename}`);
      
      await sharp(fullPath)
        .resize(size.width, size.height, { fit: 'inside' })
        .jpeg({ quality: 85 })
        .toFile(outputPath);
    }
    
    logger.info(`Thumbnails generated for book ${bookId}`);
    
    return { success: true };
  } catch (error) {
    logger.error(`Thumbnail generation failed for book ${bookId}:`, error);
    throw error;
  }
});

// Email queue processing
emailQueue.process('send-email', async (job) => {
  const { to, subject, html, attachments } = job.data;
  
  try {
    const emailService = require('../services/emailService');
    await emailService.sendMail(to, subject, html, attachments);
    
    logger.info(`Email sent to ${to}`);
    return { success: true };
  } catch (error) {
    logger.error(`Email sending failed to ${to}:`, error);
    throw error;
  }
});

// Search indexing queue processing
searchIndexQueue.process('index-book', async (job) => {
  const { bookId } = job.data;
  
  try {
    const book = await Book.findByPk(bookId, {
      include: ['authors', 'categories', 'publisher']
    });
    
    if (!book) {
      throw new Error('Book not found');
    }
    
    await search.indexBook({
      id: book.id,
      title: book.title,
      description: book.description,
      content: book.metadata?.extractedText,
      isbn: book.isbn,
      language: book.language,
      publishYear: book.publishYear,
      pageCount: book.pageCount,
      authors: book.authors,
      categories: book.categories,
      publisher: book.publisher,
      tags: book.tags,
      rating: book.rating,
      reviewCount: book.reviewCount,
      borrowCount: book.borrowCount,
      available: book.availableCopies > 0,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt
    });
    
    logger.info(`Book ${bookId} indexed in Elasticsearch`);
    return { success: true };
  } catch (error) {
    logger.error(`Search indexing failed for book ${bookId}:`, error);
    throw error;
  }
});

searchIndexQueue.process('update-book', async (job) => {
  const { bookId, updates } = job.data;
  
  try {
    await search.updateBook(bookId, updates);
    
    logger.info(`Book ${bookId} updated in Elasticsearch`);
    return { success: true };
  } catch (error) {
    logger.error(`Search update failed for book ${bookId}:`, error);
    throw error;
  }
});

searchIndexQueue.process('delete-book', async (job) => {
  const { bookId } = job.data;
  
  try {
    await search.deleteBook(bookId);
    
    logger.info(`Book ${bookId} deleted from Elasticsearch`);
    return { success: true };
  } catch (error) {
    logger.error(`Search deletion failed for book ${bookId}:`, error);
    throw error;
  }
});

// Queue event handlers
fileProcessingQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed:`, result);
});

fileProcessingQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed:`, err);
});

emailQueue.on('completed', (job, result) => {
  logger.info(`Email job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`Email job ${job.id} failed:`, err);
});

searchIndexQueue.on('completed', (job, result) => {
  logger.info(`Search index job ${job.id} completed:`, result);
});

searchIndexQueue.on('failed', (job, err) => {
  logger.error(`Search index job ${job.id} failed:`, err);
});

// Queue management functions
async function addFileProcessingJob(type, data) {
  return fileProcessingQueue.add(type, data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
}

async function addEmailJob(data) {
  return emailQueue.add('send-email', data, {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  });
}

async function addSearchIndexJob(type, data) {
  return searchIndexQueue.add(type, data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });
}

async function getQueueStats() {
  const [
    fileWaiting,
    fileActive,
    fileCompleted,
    fileFailed,
    emailWaiting,
    emailActive,
    emailCompleted,
    emailFailed,
    searchWaiting,
    searchActive,
    searchCompleted,
    searchFailed
  ] = await Promise.all([
    fileProcessingQueue.getWaitingCount(),
    fileProcessingQueue.getActiveCount(),
    fileProcessingQueue.getCompletedCount(),
    fileProcessingQueue.getFailedCount(),
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
    emailQueue.getCompletedCount(),
    emailQueue.getFailedCount(),
    searchIndexQueue.getWaitingCount(),
    searchIndexQueue.getActiveCount(),
    searchIndexQueue.getCompletedCount(),
    searchIndexQueue.getFailedCount()
  ]);
  
  return {
    fileProcessing: {
      waiting: fileWaiting,
      active: fileActive,
      completed: fileCompleted,
      failed: fileFailed
    },
    email: {
      waiting: emailWaiting,
      active: emailActive,
      completed: emailCompleted,
      failed: emailFailed
    },
    searchIndex: {
      waiting: searchWaiting,
      active: searchActive,
      completed: searchCompleted,
      failed: searchFailed
    }
  };
}

async function cleanQueues() {
  await Promise.all([
    fileProcessingQueue.clean(24 * 3600 * 1000), // Clean jobs older than 24 hours
    emailQueue.clean(24 * 3600 * 1000),
    searchIndexQueue.clean(24 * 3600 * 1000)
  ]);
  
  logger.info('Queues cleaned');
}

async function initializeQueues() {
  // Clean old jobs on startup
  await cleanQueues();
  
  logger.info('Queues initialized');
}

module.exports = {
  initializeQueues,
  addFileProcessingJob,
  addEmailJob,
  addSearchIndexJob,
  getQueueStats,
  fileProcessingQueue,
  emailQueue,
  searchIndexQueue
};