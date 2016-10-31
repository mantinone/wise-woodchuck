const databaseName = 'woodchuckBooks'
const connectionString = `postgres://${process.env.USER}@localhost:5432/${databaseName}`
const pgp = require('pg-promise')();
const db = pgp( connectionString );

const getBookDetails = book_id => {
  const sql = `
    SELECT * FROM book WHERE book.id=$1
  `
  return db.one(sql, [book_id])
}
const getAuthorByBookId = book_id => {
  const sql = `
    SELECT name, id FROM author
    JOIN book_author ON book_author.author_id=author.id
    WHERE book_author.book_id=$1
  `
  return db.any(sql, [book_id])
}

module.exports = {
  getBookDetails:getBookDetails, getAuthorByBookId:getAuthorByBookId
}
