const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  institutionId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  reportType: {
    type: DataTypes.ENUM(
      'günlük',
      'haftalık',
      'aylık',
      'yıllık',
      'özel',
      'bakanlık',
      'belediye'
    ),
    allowNull: false
  },
  period: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Rapor dönemi {startDate, endDate}'
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Rapor verileri'
  },
  summary: {
    type: DataTypes.JSON,
    defaultValue: {
      totalWaste: 0,
      recyclingRate: 0,
      wasteByType: {},
      comparisonWithPrevious: {}
    }
  },
  generatedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  approvedBy: {
    type: DataTypes.UUID
  },
  approvalDate: {
    type: DataTypes.DATE
  },
  submittedToMinistry: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  submissionDate: {
    type: DataTypes.DATE
  },
  submissionResponse: {
    type: DataTypes.JSON
  },
  fileUrl: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('taslak', 'onay_bekliyor', 'onaylandı', 'gönderildi'),
    defaultValue: 'taslak'
  }
});

module.exports = Report;