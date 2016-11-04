const databaseName = 'woodchuckBooks'
const connectionString = process.env.DATABASE_URL || `postgres://${process.env.USER}@localhost:5432/${databaseName}`
const pgp = require('pg-promise')();
const db = pgp( connectionString );

const getBook = `SELECT id, title, publication_date, description, img_url, price::money::numeric::float8 FROM book WHERE book.id=$1`

const getLimitBooks = `SELECT * FROM (
SELECT author.id AS author_id, book.id AS book_id, book.title, book.img_url, book.price, author.name,
ROW_NUMBER() OVER (PARTITION BY book.id ORDER BY book.id ASC)
FROM book LEFT JOIN book_author ON book_author.book_id=book.id
LEFT JOIN author ON author.id=book_author.author_id) b WHERE row_number=1
LIMIT $1 OFFSET $2`

const getAuthor = `SELECT * FROM author WHERE author.id=$1`
const getGenres = `SELECT * FROM tag`
const getGenre = `SELECT * FROM tag WHERE id=$1`

const createAuthor = `
  INSERT INTO author (name, bio, img_url)
  VALUES($1, $2, $3) RETURNING *
`

const getAuthorByBookId = `
  SELECT name, id FROM author
  JOIN book_author ON book_author.author_id=author.id
  WHERE book_author.book_id=$1
  `

  const getBooksByGenreId =`
  SELECT * FROM book
  JOIN book_tag ON book_tag.book_id=book.id
  WHERE book_tag.tag_id=$1`

const getGenreByBookId=`
  SELECT * FROM tag
  JOIN book_tag ON book_tag.tag_id=tag.id
  WHERE book_tag.book_id=$1
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
const editAuthorDetails = `
  UPDATE author SET name = $1, bio = $2, img_url = $3 WHERE id=$4 RETURNING *
`

const editBookDetails = `
  UPDATE book SET title = $1, publication_date = $2, description = $3, img_url = $4, price = $5 WHERE id=$6 RETURNING *
`

const bookIsActive = `
  UPDATE book SET is_active = $1
`

const authorIsActive = `
  UPDATE author SET is_active = $1
`

const editGenre = `
  UPDATE tag SET item = $1, description = $2
`

const getCartItems = `
  SELECT *
  FROM book JOIN book_transaction ON book.id=book_transaction.book_id
  WHERE book_transaction.transaction_id=$1
`

const getCartTotal = `
  SELECT SUM(book.price*book_transaction.copies)
  FROM book JOIN book_transaction ON book.id=book_transaction.book_id
  WHERE book_transaction.transaction_id=$1
`

const setTotal = `
UPDATE transaction
SET total = (SELECT SUM(book.price*book_transaction.copies)
FROM book JOIN book_transaction ON book.id=book_transaction.book_id
WHERE book_transaction.transaction_id=$1)
WHERE id = $1
RETURNING *
`

const getTransactionById = `
  SELECT * FROM transaction WHERE id=$1
`

const addBookToCart = `
  INSERT INTO book_transaction (transaction_id, book_id, copies)
  VALUES($1, $2, $3) RETURNING *
`

const createTransaction =`
  INSERT INTO transaction (customer_id, order_date, total)
  VALUES($1, CURRENT_TIMESTAMP, $2) RETURNING *
`

const setIsComplete = `
  UPDATE transaction
  SET is_complete = TRUE
  WHERE id=$1
  RETURNING *
`

const setIsActive = `
  UPDATE transaction
  SET is_active = FALSE
  WHERE id=$1
  RETURNING *
`

const findOpenTransactions = `
  SELECT *
  FROM transaction
  WHERE customer_id=$1 AND is_complete=false
  LIMIT 1
`

const Search = {
  findBooks: searchq => {
    console.log('IN THE DB FILE', searchq)
    return db.any('SELECT * FROM book')
  }

}

const Book = {
  delete: value => db.one(bookIsActive, [value.is_active]),
  editDetails: attributes => db.one(editBookDetails, [attributes.title, attributes.publication_date, attributes.description, attributes.img_url, attributes.price, attributes.id ]),
  getDetails: book_id => db.one(getBook, [book_id]),
  getAuthors: book_id => db.any(getAuthorByBookId, [book_id]),
  getGenres: book_id => db.any(getGenreByBookId, [book_id]),
  createBook: book_Details => db.one(createBook, [book_Details.title, book_Details.publication_date, book_Details.description, book_Details.img_url, book_Details.price]),
  getLimit: (size, page) => db.any(getLimitBooks, [size, (page*size) - size]),
  orderActive: is_active => db.one(setIsActive, [is_active])

}

const Author = {
  delete: value => db.one(authorIsActive, [value.is_active]),
  editDetails: attributes => db.one(editAuthorDetails, [attributes.name, attributes.bio, attributes.img_url, attributes.id ]),
  getDetails: author_id => db.one(getAuthor, [author_id]),
  getBooks: author_id => db.any(getBookByAuthorId, [author_id]),
  getAll: () => db.any(getAllAuthors),
  bookAuthor: (author_id, book_id) => db.any(addBookAuthor, [author_id, book_id]),
  orderActive: is_active => db.one(setIsActive, [is_active]),
  createAuthor: attributes => db.one(createAuthor, [attributes.name, attributes.bio, attributes.img_url])
}

const Genre = {
  editDetails: attributes => db.one(editGenre, [attributes.tag, attributes.description]),
  getDetails: tag_id => db.one(getGenre, [tag_id]),
  getAll: () => db.any(getGenres),
  getBooks: tag_id => db.any(getBooksByGenreId, [tag_id])
}

const Transaction = {
  getCartItems: transaction_id => db.any(getCartItems, [transaction_id]),
  getTotal: transaction_id => db.one(getCartTotal, [transaction_id]),
  getDetails: transaction_id => db.one(getTransactionById, [transaction_id]),
  addBook: (transaction_id, book_id, copies) => db.one(addBookToCart, [transaction_id, book_id, copies]),
  addNew: (customer_id, total) => db.one(createTransaction, [customer_id, total]),
  updateTotal: transaction_id => db.one(setTotal, [transaction_id]),
  orderComplete: transaction_id => db.one(setIsComplete, [transaction_id]),
  orderActive: is_active => db.one(setIsActive, [is_active]),
  isOpen: customer_id => db.oneOrNone(findOpenTransactions, [customer_id])
}

module.exports = { Book, Author, Genre, Transaction, Search }
