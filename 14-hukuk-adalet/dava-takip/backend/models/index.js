const sequelize = require('../config/database');
const User = require('./User');
const Client = require('./Client');
const Case = require('./Case');
const Court = require('./Court');
const Hearing = require('./Hearing');
const Document = require('./Document');
const Note = require('./Note');
const Notification = require('./Notification');
const Task = require('./Task');

// User associations
User.hasMany(Case, { as: 'assignedCases', foreignKey: 'assignedLawyerId' });
User.hasMany(Note, { as: 'notes', foreignKey: 'authorId' });
User.hasMany(Notification, { as: 'notifications', foreignKey: 'userId' });
User.hasMany(Task, { as: 'assignedTasks', foreignKey: 'assignedTo' });
User.hasMany(Task, { as: 'createdTasks', foreignKey: 'assignedBy' });
User.hasMany(Document, { as: 'uploadedDocuments', foreignKey: 'uploadedBy' });

// Client associations
Client.hasMany(Case, { as: 'cases', foreignKey: 'clientId' });

// Case associations
Case.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });
Case.belongsTo(User, { as: 'assignedLawyer', foreignKey: 'assignedLawyerId' });
Case.belongsTo(Court, { as: 'court', foreignKey: 'courtId' });
Case.hasMany(Hearing, { as: 'hearings', foreignKey: 'caseId' });
Case.hasMany(Document, { as: 'documents', foreignKey: 'caseId' });
Case.hasMany(Note, { as: 'notes', foreignKey: 'caseId' });
Case.hasMany(Task, { as: 'tasks', foreignKey: 'caseId' });
Case.belongsToMany(User, { 
  through: 'case_team_members', 
  as: 'teamMembers',
  foreignKey: 'caseId',
  otherKey: 'userId'
});

// Court associations
Court.hasMany(Case, { as: 'cases', foreignKey: 'courtId' });

// Hearing associations
Hearing.belongsTo(Case, { as: 'case', foreignKey: 'caseId' });

// Document associations
Document.belongsTo(Case, { as: 'case', foreignKey: 'caseId' });
Document.belongsTo(User, { as: 'uploader', foreignKey: 'uploadedBy' });

// Note associations
Note.belongsTo(Case, { as: 'case', foreignKey: 'caseId' });
Note.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

// Notification associations
Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Task associations
Task.belongsTo(Case, { as: 'case', foreignKey: 'caseId' });
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo' });
Task.belongsTo(User, { as: 'assigner', foreignKey: 'assignedBy' });

module.exports = {
  sequelize,
  User,
  Client,
  Case,
  Court,
  Hearing,
  Document,
  Note,
  Notification,
  Task
};