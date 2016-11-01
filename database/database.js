const databaseName = 'woodchuckBooks'
const connectionString = process.env.DATABASE_URL || `postgres://${process.env.USER}@localhost:5432/${databaseName}`
const pgp = require('pg-promise')();
const db = pgp( connectionString );

const getBook = `SELECT * FROM book WHERE book.id=$1`
const getAuthor = `SELECT * FROM author WHERE author.id=$1`

const getAuthorByBookId = `
  SELECT name, id FROM author
  JOIN book_author ON book_author.author_id=author.id
  WHERE book_author.book_id=$1
  `
const getBookByAuthorId = `
  SELECT * FROM book
  JOIN book_author ON book_author.book_id=book.id
  WHERE book_author.author_id=$1
`

const Book = {
  getDetails: book_id => db.one(getBook, [book_id]),
  getAuthors: book_id => db.any(getAuthorByBookId, [book_id])
}

const Author = {
  getDetails: author_id => db.one(getAuthor, [author_id]),
  getBooks: author_id => db.any(getBookByAuthorId, [author_id])
}

// const createBook => (request, response, next) {
//   req.body.date = parseInt(req.body.date);
//   db.none('INSERT INTO book(title, publication_date, description, img_url)' +
//             'values(${title}, ${publication_date}, ${description}, ${img_url});',
//           req.body)
//           .then(function () {
//             // res.status(200)
//             //   .json({
//             //     status: 'success',
//             //     message: 'Inserted one puppy'
//             //   });
//               res.redirect('/');
//           })
//           .catch(function (err) {
//             return next(err);
//           })
// }

module.exports = { Book, Author }
