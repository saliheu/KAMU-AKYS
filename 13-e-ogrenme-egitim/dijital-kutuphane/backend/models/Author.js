const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Author = sequelize.define('Author', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fullName: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.surname ? `${this.name} ${this.surname}` : this.name;
      }
    },
    biography: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    deathDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    birthPlace: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nationality: {
      type: DataTypes.STRING,
      allowNull: true
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    awards: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    genres: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    bookCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    socialMedia: {
      type: DataTypes.JSONB,
      defaultValue: {
        twitter: null,
        facebook: null,
        instagram: null,
        goodreads: null
      }
    }
  }, {
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['name', 'surname']
      }
    ]
  });

  return Author;
};