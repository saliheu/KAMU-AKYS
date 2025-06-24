const { sequelize } = require('../config/database');
const User = require('./User');
const Institution = require('./Institution');
const WastePoint = require('./WastePoint');
const WasteContainer = require('./WasteContainer');
const WasteEntry = require('./WasteEntry');
const WasteCollection = require('./WasteCollection');
const RecyclingCompany = require('./RecyclingCompany');
const Report = require('./Report');

// User - Institution associations
User.belongsTo(Institution, { foreignKey: 'institutionId', as: 'institution' });
Institution.hasMany(User, { foreignKey: 'institutionId', as: 'users' });

// Institution - WastePoint associations
Institution.hasMany(WastePoint, { foreignKey: 'institutionId', as: 'wastePoints' });
WastePoint.belongsTo(Institution, { foreignKey: 'institutionId', as: 'institution' });

// WastePoint - User associations (responsible)
WastePoint.belongsTo(User, { foreignKey: 'responsibleUserId', as: 'responsible' });
User.hasMany(WastePoint, { foreignKey: 'responsibleUserId', as: 'responsiblePoints' });

// WastePoint - WasteContainer associations
WastePoint.hasMany(WasteContainer, { foreignKey: 'wastePointId', as: 'containers' });
WasteContainer.belongsTo(WastePoint, { foreignKey: 'wastePointId', as: 'wastePoint' });

// WasteEntry associations
WasteEntry.belongsTo(Institution, { foreignKey: 'institutionId', as: 'institution' });
WasteEntry.belongsTo(WastePoint, { foreignKey: 'wastePointId', as: 'wastePoint' });
WasteEntry.belongsTo(WasteContainer, { foreignKey: 'containerId', as: 'container' });
WasteEntry.belongsTo(User, { foreignKey: 'enteredBy', as: 'enteredByUser' });
WasteEntry.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifiedByUser' });

// WasteCollection associations
WasteCollection.belongsTo(Institution, { foreignKey: 'institutionId', as: 'institution' });
WasteCollection.belongsTo(RecyclingCompany, { foreignKey: 'collectorCompanyId', as: 'collectorCompany' });
WasteCollection.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });

// Report associations
Report.belongsTo(Institution, { foreignKey: 'institutionId', as: 'institution' });
Report.belongsTo(User, { foreignKey: 'generatedBy', as: 'generator' });
Report.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

module.exports = {
  sequelize,
  User,
  Institution,
  WastePoint,
  WasteContainer,
  WasteEntry,
  WasteCollection,
  RecyclingCompany,
  Report
};