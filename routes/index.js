var express = require('express');
var router = express.Router();
const { Book, Author } = require('../database/database.js')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Bookstore by Max and Diana' });
});

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

module.exports = router;
