var express = require('express');
var router = express.Router();
const db = require('../database/database.js')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Bookstore by Max and Diana' });
});

router.get('/book/:book_id', (request, response) => {
  const {book_id} = request.params
  Promise.all([  db.getBookDetails(book_id), db.getAuthorByBookId(book_id)])
  .then( data => {
    const [ book, author] = data
    response.render('bookDetails', {book, author})
  })
})

module.exports = router;
