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

module.exports = { Book, Author }
