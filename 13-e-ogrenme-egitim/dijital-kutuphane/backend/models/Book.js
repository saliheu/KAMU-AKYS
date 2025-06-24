const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Book = sequelize.define('Book', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    isbn: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    language: {
      type: DataTypes.STRING(5),
      defaultValue: 'tr'
    },
    publishYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1000,
        max: new Date().getFullYear() + 1
      }
    },
    edition: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pageCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1
      }
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    file: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fileType: {
      type: DataTypes.ENUM('pdf', 'epub', 'mobi', 'txt', 'doc', 'docx'),
      allowNull: true
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deweyCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    barcode: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    totalCopies: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 0
      }
    },
    availableCopies: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 0
      }
    },
    borrowCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    isDigital: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    allowDownload: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    accessLevel: {
      type: DataTypes.ENUM('public', 'members', 'premium'),
      defaultValue: 'public'
    },
    status: {
      type: DataTypes.ENUM('available', 'borrowed', 'reserved', 'lost', 'damaged', 'processing'),
      defaultValue: 'available'
    },
    acquisitionDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['isbn']
      },
      {
        fields: ['title']
      },
      {
        fields: ['status']
      },
      {
        fields: ['publishYear']
      },
      {
        type: 'FULLTEXT',
        fields: ['title', 'description']
      }
    ]
  });

  return Book;
};