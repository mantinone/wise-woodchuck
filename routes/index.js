var express = require('express');
var router = express.Router();
const { Book, Author } = require('../database/database.js')

/* GET home page. */
router.get('/', (request, response) => {
  const {query} = request
  const page = parseInt( query.page || 1)
  const size = parseInt( query.size || 10)
  const nextPage = page+1
  const previousPage = page - 1 > 0 ? page -1: 1
  Book.getLimit(size, page).then( books => {
    response.render('index', { books, page, size, nextPage, previousPage })
  })
})

router.get('/book/:book_id', (request, response) => {
  const {book_id} = request.params
  Promise.all([  Book.getDetails(book_id), Book.getAuthors(book_id)])
  .then( data => {
    const [ book, author] = data
    response.render('bookDetails', {book, author})
  })
})

router.get('/author/:author_id', (request, response) => {
  const author_id = request.params.author_id
  Promise.all([ Author.getDetails(author_id), Author.getBooks(author_id)])
  .then( data => {
    const [author, books] = data
    response.render('authorDetails', {author, books})
  })
})

router.get('/addAuthor', (request, response) => {
  response.render('addAuthor', {
  })
  return
})

router.get('/addBook', (request, response) => {
  Author.getAll()
  .then( data => {
    response.render('addBook', {
      data
    })
  })
  return
})


router.post('/addBook', (request, response) => {
  const author_id = request.body.author_id
  Book.createBook(request.body)
  .then( book => {
    const book_id = book.id
    Author.bookAuthor( author_id, book_id )
    response.redirect(`/book/${book_id}`)
  })
})

module.exports = router;
