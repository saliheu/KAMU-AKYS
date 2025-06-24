const sequelize = require('../config/database');
const User = require('./User')(sequelize);
const Book = require('./Book')(sequelize);
const Author = require('./Author')(sequelize);
const Category = require('./Category')(sequelize);
const Publisher = require('./Publisher')(sequelize);
const Borrowing = require('./Borrowing')(sequelize);
const Reservation = require('./Reservation')(sequelize);
const Review = require('./Review')(sequelize);
const Collection = require('./Collection')(sequelize);
const Notification = require('./Notification')(sequelize);

// Define associations

// Book - Author (Many to Many)
Book.belongsToMany(Author, {
  through: 'book_authors',
  as: 'authors',
  foreignKey: 'book_id'
});
Author.belongsToMany(Book, {
  through: 'book_authors',
  as: 'books',
  foreignKey: 'author_id'
});

// Book - Category (Many to Many)
Book.belongsToMany(Category, {
  through: 'book_categories',
  as: 'categories',
  foreignKey: 'book_id'
});
Category.belongsToMany(Book, {
  through: 'book_categories',
  as: 'books',
  foreignKey: 'category_id'
});

// Book - Publisher (Many to One)
Book.belongsTo(Publisher, {
  as: 'publisher',
  foreignKey: 'publisher_id'
});
Publisher.hasMany(Book, {
  as: 'books',
  foreignKey: 'publisher_id'
});

// Borrowing associations
Borrowing.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId'
});
Borrowing.belongsTo(Book, {
  as: 'book',
  foreignKey: 'bookId'
});
Borrowing.belongsTo(User, {
  as: 'issuer',
  foreignKey: 'issuedBy'
});
Borrowing.belongsTo(User, {
  as: 'returner',
  foreignKey: 'returnedTo'
});

User.hasMany(Borrowing, {
  as: 'borrowings',
  foreignKey: 'userId'
});
Book.hasMany(Borrowing, {
  as: 'borrowings',
  foreignKey: 'bookId'
});

// Reservation associations
Reservation.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId'
});
Reservation.belongsTo(Book, {
  as: 'book',
  foreignKey: 'bookId'
});

User.hasMany(Reservation, {
  as: 'reservations',
  foreignKey: 'userId'
});
Book.hasMany(Reservation, {
  as: 'reservations',
  foreignKey: 'bookId'
});

// Review associations
Review.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId'
});
Review.belongsTo(Book, {
  as: 'book',
  foreignKey: 'bookId'
});

User.hasMany(Review, {
  as: 'reviews',
  foreignKey: 'userId'
});
Book.hasMany(Review, {
  as: 'reviews',
  foreignKey: 'bookId'
});

// Collection associations
Collection.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId'
});
User.hasMany(Collection, {
  as: 'collections',
  foreignKey: 'userId'
});

// Collection - Book (Many to Many)
Collection.belongsToMany(Book, {
  through: 'collection_books',
  as: 'books',
  foreignKey: 'collection_id'
});
Book.belongsToMany(Collection, {
  through: 'collection_books',
  as: 'collections',
  foreignKey: 'book_id'
});

// Notification associations
Notification.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId'
});
User.hasMany(Notification, {
  as: 'notifications',
  foreignKey: 'userId'
});

// Review Helpful (Many to Many)
Review.belongsToMany(User, {
  through: 'review_helpful',
  as: 'helpfulVoters',
  foreignKey: 'review_id'
});
User.belongsToMany(Review, {
  through: 'review_helpful',
  as: 'helpfulReviews',
  foreignKey: 'user_id'
});

// Collection Followers (Many to Many)
Collection.belongsToMany(User, {
  through: 'collection_followers',
  as: 'followers',
  foreignKey: 'collection_id'
});
User.belongsToMany(Collection, {
  through: 'collection_followers',
  as: 'followedCollections',
  foreignKey: 'user_id'
});

module.exports = {
  sequelize,
  User,
  Book,
  Author,
  Category,
  Publisher,
  Borrowing,
  Reservation,
  Review,
  Collection,
  Notification
};