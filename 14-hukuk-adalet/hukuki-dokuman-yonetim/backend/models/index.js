const User = require('./User');
const Document = require('./Document');
const Version = require('./Version');
const Workflow = require('./Workflow');
const Share = require('./Share');
const Template = require('./Template');

// User associations
User.hasMany(Document, { as: 'documents', foreignKey: 'createdBy' });
User.hasMany(Document, { as: 'lockedDocuments', foreignKey: 'lockedBy' });
User.hasMany(Version, { as: 'versions', foreignKey: 'createdBy' });
User.hasMany(Workflow, { as: 'initiatedWorkflows', foreignKey: 'initiatedBy' });
User.hasMany(Share, { as: 'shares', foreignKey: 'sharedBy' });
User.hasMany(Template, { as: 'templates', foreignKey: 'createdBy' });

// Document associations
Document.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Document.belongsTo(User, { as: 'locker', foreignKey: 'lockedBy' });
Document.hasMany(Version, { as: 'versions', foreignKey: 'documentId' });
Document.hasMany(Workflow, { as: 'workflows', foreignKey: 'documentId' });
Document.hasMany(Share, { as: 'shares', foreignKey: 'documentId' });
Document.belongsTo(Document, { as: 'parentDocument', foreignKey: 'parentDocumentId' });
Document.hasMany(Document, { as: 'childDocuments', foreignKey: 'parentDocumentId' });

// Version associations
Version.belongsTo(Document, { as: 'document', foreignKey: 'documentId' });
Version.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

// Workflow associations
Workflow.belongsTo(Document, { as: 'document', foreignKey: 'documentId' });
Workflow.belongsTo(User, { as: 'initiator', foreignKey: 'initiatedBy' });

// Share associations
Share.belongsTo(Document, { as: 'document', foreignKey: 'documentId' });
Share.belongsTo(User, { as: 'sharer', foreignKey: 'sharedBy' });
Share.belongsTo(User, { as: 'recipient', foreignKey: 'sharedWith' });

// Template associations
Template.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

module.exports = {
  User,
  Document,
  Version,
  Workflow,
  Share,
  Template
};