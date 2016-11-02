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

const createBook = `
  INSERT INTO book (title, publication_date, description, img_url, price)
  VALUES($1, $2, $3, $4, $5) returning *
`
const addBookAuthor = `
  INSERT INTO book_author (author_id, book_id)
  VALUES($1, $2)
`

const getAllAuthors = `
  SELECT name, id FROM author
`

const Book = {
  getDetails: book_id => db.one(getBook, [book_id]),
  getAuthors: book_id => db.any(getAuthorByBookId, [book_id]),
  createBook: book_Details => db.one(createBook, [book_Details.title, book_Details.publication_date, book_Details.description, book_Details.img_url, book_Details.price])
}

const Author = {
  getDetails: author_id => db.one(getAuthor, [author_id]),
  getBooks: author_id => db.any(getBookByAuthorId, [author_id]),
  getAll: () => db.any(getAllAuthors),
  bookAuthor: (author_id, book_id) => db.any(addBookAuthor, [author_id, book_id])
  //bookAuthor: (book_id, author_id) => db.one(addBookAuthor, [book_id, author_id])
}


module.exports = { Book, Author }
