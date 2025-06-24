const sequelize = require('../config/database');
const User = require('./User');
const Institution = require('./Institution');
const Disaster = require('./Disaster');
const Resource = require('./Resource');
const ResourceRequest = require('./ResourceRequest');
const HelpRequest = require('./HelpRequest');
const Personnel = require('./Personnel');
const Volunteer = require('./Volunteer');
const Team = require('./Team');
const Location = require('./Location');
const SafeZone = require('./SafeZone');
const Report = require('./Report');
const Notification = require('./Notification');

// User - Institution associations
User.belongsTo(Institution, { foreignKey: 'institutionId' });
Institution.hasMany(User, { foreignKey: 'institutionId' });

// Disaster associations
Disaster.belongsTo(User, { as: 'coordinator', foreignKey: 'coordinatorId' });
Disaster.hasMany(Location, { as: 'affectedAreas', foreignKey: 'disasterId' });
Disaster.hasMany(SafeZone, { foreignKey: 'disasterId' });
Disaster.hasMany(ResourceRequest, { foreignKey: 'disasterId' });
Disaster.hasMany(HelpRequest, { foreignKey: 'disasterId' });
Disaster.hasMany(Team, { foreignKey: 'disasterId' });

// Resource associations
Resource.belongsTo(Institution, { foreignKey: 'institutionId' });
Institution.hasMany(Resource, { foreignKey: 'institutionId' });

// ResourceRequest associations
ResourceRequest.belongsTo(Disaster, { foreignKey: 'disasterId' });
ResourceRequest.belongsTo(Institution, { as: 'requester', foreignKey: 'requesterId' });
ResourceRequest.belongsTo(Institution, { as: 'provider', foreignKey: 'providerId' });
ResourceRequest.belongsTo(User, { as: 'requestedBy', foreignKey: 'requestedById' });
ResourceRequest.belongsTo(User, { as: 'approvedBy', foreignKey: 'approvedById' });

// HelpRequest associations
HelpRequest.belongsTo(Disaster, { foreignKey: 'disasterId' });
HelpRequest.belongsTo(Location, { foreignKey: 'locationId' });
HelpRequest.belongsTo(Team, { as: 'assignedTeam', foreignKey: 'assignedTeamId' });
HelpRequest.belongsTo(User, { as: 'assignedBy', foreignKey: 'assignedById' });

// Personnel associations
Personnel.belongsTo(Institution, { foreignKey: 'institutionId' });
Personnel.belongsTo(User, { foreignKey: 'userId' });
Personnel.belongsTo(Team, { foreignKey: 'teamId' });
Institution.hasMany(Personnel, { foreignKey: 'institutionId' });

// Volunteer associations
Volunteer.belongsTo(User, { foreignKey: 'userId' });
Volunteer.belongsTo(Team, { foreignKey: 'teamId' });

// Team associations
Team.belongsTo(Disaster, { foreignKey: 'disasterId' });
Team.belongsTo(User, { as: 'leader', foreignKey: 'leaderId' });
Team.hasMany(Personnel, { as: 'members', foreignKey: 'teamId' });
Team.hasMany(Volunteer, { as: 'volunteers', foreignKey: 'teamId' });
Team.hasMany(HelpRequest, { as: 'assignments', foreignKey: 'assignedTeamId' });

// Location associations
Location.belongsTo(Disaster, { foreignKey: 'disasterId' });
Location.hasMany(HelpRequest, { foreignKey: 'locationId' });

// SafeZone associations
SafeZone.belongsTo(Disaster, { foreignKey: 'disasterId' });
SafeZone.belongsTo(Location, { foreignKey: 'locationId' });

// Report associations
Report.belongsTo(Disaster, { foreignKey: 'disasterId' });
Report.belongsTo(User, { as: 'generatedBy', foreignKey: 'generatedById' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId' });
Notification.belongsTo(Disaster, { foreignKey: 'disasterId' });

module.exports = {
  sequelize,
  User,
  Institution,
  Disaster,
  Resource,
  ResourceRequest,
  HelpRequest,
  Personnel,
  Volunteer,
  Team,
  Location,
  SafeZone,
  Report,
  Notification
};