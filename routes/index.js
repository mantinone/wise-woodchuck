var express = require('express');
var router = express.Router();
const { Book, Author, Genre, Transaction } = require('../database/database.js')

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


router.get('/genre', (request, response) => {
  Genre.getAll()
  .then( genres => {
    response.render('genreList', {genres} )
    //response.send(genres)
  })
})

router.get('/genre/:genre_id', (request, response) => {
  const genre_id = request.params.genre_id
  Promise.all([Genre.getDetails(genre_id), Genre.getBooks(genre_id)])
  .then( data => {
    const [ genre, books ] = data
    response.render( 'genreDetails', { genre, books } )
  })
} )

router.get('/author/:author_id/edit', (request, response) => {
  const {author_id} = request.params
  Author.getDetails(author_id)
  .then( author => {
    response.render('editAuthor', author)
  })
})

router.post('/author/:author_id/edit', (request, response) => {
  const ourAuthor = request.body
  ourAuthor.id = request.params.author_id
  Author.editDetails(ourAuthor)
  .then( data => {
    response.redirect( `/author/${data.id}` )
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

router.post('/addAuthor', (request, response) => {
  Author.createAuthor(request.body)
  .then( ourAuthor => {
    const author_id = ourAuthor.id
    response.redirect(`/author/${author_id}`)
  })
})

router.get('/book/:book_id/edit', (request, response) => {
  const {book_id} = request.params
  Book.getDetails(book_id)
  .then( book => {
    var s = ""
    s = s + book.publication_date
    // var n = s.indexOf('T')
    s = s.substring(4, 15)
    book.publication_date = s
     //response.send(book)
    response.render('editBook', book)
  })
})

router.post('/book/:book_id/edit', (request, response) => {
  const ourBook = request.body
  ourBook.id = request.params.book_id
  Book.editDetails(ourBook)
  .then( data => {
    console.log("Do we have a book: " + data)
    response.redirect( `/book/${data.id}` )
  })
})

router.get('/book/:book_id', (request, response) => {
  const {book_id} = request.params
  Promise.all([  Book.getDetails(book_id), Book.getAuthors(book_id), Book.getGenres(book_id)])
  .then( data => {
    const [ book, authors, genres] = data
    response.render('bookDetails', {book, authors, genres})
  })
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

router.get('/cart/:transaction_id', (request,response) => {
  const transaction_id = request.params.transaction_id
  Promise.all([ Transaction.getDetails( transaction_id), Transaction.getCartItems(transaction_id) ])
  .then( data => {
    const [transaction, books] = data
    response.render('cart', {transaction, books})
  })
})

router.post('/cart/add/:book_id', (request, response) => {
  const book_id = request.params.book_id
  const copies = request.body.copies
  const book_price = request.body.price * copies
  const customer_id = 1 //This is a hard-coded user variable in place because we have no user authentication
  Transaction.isOpen(customer_id)
  .then( transaction => {
    if (transaction){
      const transaction_id = transaction.id
      Transaction.addBook(transaction_id, book_id, copies)
      .then( result => {
        Transaction.updateTotal(transaction_id)
        .then( result => {
          response.redirect(`/cart/${transaction_id}`)
        })
      })
    } else{
      Transaction.addNew(customer_id, book_price)
      .then( transaction => {
        const transaction_id = transaction.id
        Transaction.addBook(transaction_id, book_id, copies)
        .then(result => {
          response.redirect(`/cart/${transaction_id}`)
        })
      })
    }
  })

})

router.post('/cart/confirm/:transaction_id', (request, response) => {
  const transaction_id = request.params.transaction_id
  Transaction.orderComplete(transaction_id)
  .then( result => {
    response.render('orderConfirmed', result)
  })
  .catch( error => response.render('error', { error : error }));
})

module.exports = router;
