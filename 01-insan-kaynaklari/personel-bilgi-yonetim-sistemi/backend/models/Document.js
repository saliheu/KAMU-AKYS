const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    personnelId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Personnel',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM(
        'contract',
        'id_copy',
        'diploma',
        'certificate',
        'medical_report',
        'criminal_record',
        'reference_letter',
        'other'
      ),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER
    },
    mimeType: {
      type: DataTypes.STRING
    },
    uploadedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    expiryDate: {
      type: DataTypes.DATEONLY
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verifiedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    verifiedDate: {
      type: DataTypes.DATE
    }
  }, {
    indexes: [
      {
        fields: ['personnelId']
      },
      {
        fields: ['type']
      },
      {
        fields: ['expiryDate']
      }
    ]
  });

  Document.associate = (models) => {
    Document.belongsTo(models.User, { as: 'uploader', foreignKey: 'uploadedBy' });
    Document.belongsTo(models.User, { as: 'verifier', foreignKey: 'verifiedBy' });
  };

  return Document;
};