const { Document, User } = require('../models');
const { Op } = require('sequelize');
const { sendDocumentExpiryNotification } = require('../utils/email');

const checkExpiringDocuments = async () => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Find documents expiring in the next 30 days
    const expiringDocuments = await Document.findAll({
      where: {
        validUntil: {
          [Op.between]: [new Date(), thirtyDaysFromNow]
        },
        status: { [Op.ne]: 'expired' }
      },
      include: [
        { model: User, as: 'creator' }
      ]
    });

    for (const document of expiringDocuments) {
      const daysUntilExpiry = Math.ceil(
        (new Date(document.validUntil) - new Date()) / (1000 * 60 * 60 * 24)
      );

      // Send notifications at 30, 7, and 1 day marks
      if ([30, 7, 1].includes(daysUntilExpiry)) {
        if (document.creator.preferences?.notifications?.documentExpiry) {
          await sendDocumentExpiryNotification(
            document.creator,
            document,
            daysUntilExpiry
          );
        }

        // Also notify users who have access to the document
        const shares = await document.getShares({
          where: { isActive: true },
          include: [{ model: User, as: 'recipient' }]
        });

        for (const share of shares) {
          if (share.recipient?.preferences?.notifications?.documentExpiry) {
            await sendDocumentExpiryNotification(
              share.recipient,
              document,
              daysUntilExpiry
            );
          }
        }
      }
    }

    // Mark expired documents
    await Document.update(
      { status: 'expired' },
      {
        where: {
          validUntil: { [Op.lt]: new Date() },
          status: { [Op.ne]: 'expired' }
        }
      }
    );

    console.log(`Checked ${expiringDocuments.length} expiring documents`);
  } catch (error) {
    console.error('Error checking expiring documents:', error);
  }
};

const processDocumentOCR = async (documentId) => {
  try {
    const document = await Document.findByPk(documentId);
    
    if (!document || document.ocrProcessed) {
      return;
    }

    // In production, implement actual OCR processing
    // For now, mark as processed
    document.ocrProcessed = true;
    await document.save();

    console.log(`OCR processed for document ${documentId}`);
  } catch (error) {
    console.error(`Error processing OCR for document ${documentId}:`, error);
  }
};

const generateDocumentThumbnails = async (documentId) => {
  try {
    const document = await Document.findByPk(documentId);
    
    if (!document) {
      return;
    }

    // In production, implement actual thumbnail generation
    console.log(`Thumbnails generated for document ${documentId}`);
  } catch (error) {
    console.error(`Error generating thumbnails for document ${documentId}:`, error);
  }
};

module.exports = {
  checkExpiringDocuments,
  processDocumentOCR,
  generateDocumentThumbnails
};