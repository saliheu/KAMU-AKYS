const { Version, Share, Document } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');

const cleanupOldVersions = async () => {
  try {
    // Get retention settings
    const redisClient = require('../server').app.get('redisClient');
    const settings = await redisClient.get('system_settings');
    const { 
      versionRetentionDays = 90,
      maxVersionsPerDocument = 50 
    } = settings ? JSON.parse(settings) : {};

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - versionRetentionDays);

    // Find old versions to archive
    const oldVersions = await Version.findAll({
      where: {
        createdAt: { [Op.lt]: cutoffDate },
        isArchived: false
      }
    });

    for (const version of oldVersions) {
      // Check if this is the current version
      const document = await Document.findByPk(version.documentId);
      if (document && version.versionNumber === document.currentVersion) {
        continue; // Skip current version
      }

      // Archive the version
      version.isArchived = true;
      await version.save();

      // Delete the physical file
      try {
        const filePath = path.join(__dirname, '..', version.fileUrl);
        await fs.unlink(filePath);
      } catch (err) {
        console.error(`Error deleting version file ${version.fileUrl}:`, err);
      }
    }

    // Check for documents with too many versions
    const documents = await Document.findAll();
    
    for (const document of documents) {
      const versions = await Version.findAll({
        where: { 
          documentId: document.id,
          isArchived: false
        },
        order: [['versionNumber', 'DESC']]
      });

      if (versions.length > maxVersionsPerDocument) {
        // Keep only the most recent versions
        const versionsToArchive = versions.slice(maxVersionsPerDocument);
        
        for (const version of versionsToArchive) {
          version.isArchived = true;
          await version.save();

          try {
            const filePath = path.join(__dirname, '..', version.fileUrl);
            await fs.unlink(filePath);
          } catch (err) {
            console.error(`Error deleting version file ${version.fileUrl}:`, err);
          }
        }
      }
    }

    console.log(`Cleaned up ${oldVersions.length} old versions`);
  } catch (error) {
    console.error('Error cleaning up old versions:', error);
  }
};

const cleanupExpiredShares = async () => {
  try {
    // Find and deactivate expired shares
    const result = await Share.update(
      { isActive: false },
      {
        where: {
          expiresAt: { [Op.lt]: new Date() },
          isActive: true
        }
      }
    );

    // Find shares that exceeded download limit
    const overLimitShares = await Share.findAll({
      where: {
        maxDownloads: { [Op.not]: null },
        isActive: true
      }
    });

    let deactivatedCount = 0;
    for (const share of overLimitShares) {
      if (share.downloadCount >= share.maxDownloads) {
        share.isActive = false;
        await share.save();
        deactivatedCount++;
      }
    }

    console.log(`Cleaned up ${result[0] + deactivatedCount} expired shares`);
  } catch (error) {
    console.error('Error cleaning up expired shares:', error);
  }
};

const cleanupTempFiles = async () => {
  try {
    const tempDir = path.join(__dirname, '../uploads/temp');
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    try {
      const files = await fs.readdir(tempDir);
      
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtimeMs < oneDayAgo) {
          await fs.unlink(filePath);
        }
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }

    console.log('Cleaned up temporary files');
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
};

const cleanupOrphanedFiles = async () => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads/documents');
    const files = await fs.readdir(uploadsDir);

    let orphanedCount = 0;

    for (const file of files) {
      const fileUrl = `/uploads/documents/${file}`;
      
      // Check if file is referenced in documents
      const documentExists = await Document.findOne({
        where: { fileUrl }
      });

      // Check if file is referenced in versions
      const versionExists = await Version.findOne({
        where: { fileUrl }
      });

      if (!documentExists && !versionExists) {
        const filePath = path.join(uploadsDir, file);
        await fs.unlink(filePath);
        orphanedCount++;
      }
    }

    console.log(`Cleaned up ${orphanedCount} orphaned files`);
  } catch (error) {
    console.error('Error cleaning up orphaned files:', error);
  }
};

module.exports = {
  cleanupOldVersions,
  cleanupExpiredShares,
  cleanupTempFiles,
  cleanupOrphanedFiles
};