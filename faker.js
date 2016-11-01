const databaseName = 'woodchuckBooks'
const connectionString = `postgres://${process.env.USER}@localhost:5432/${databaseName}`
const pgp = require('pg-promise')();
const db = pgp( connectionString );

const faker = require( 'faker' )

const fakeAuthors = author => {
  const sql = 'INSERT INTO author(name, bio, img_url) VALUES ( $1, $2, $3)'
  db.none( sql, [author.name, author.bio, author.img_url])
}

const generateAuthors = () => {
  for (let i = 0; i < 50; i++){
    fakeAuthors({
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      bio: faker.lorem.paragraph(),
      img_url: faker.image.people()
    })
  }
}

const fakeBooks = book => {
  const sql = 'INSERT INTO book(title, publication_date, description, img_url) VALUES ( $1, $2, $3, $4)'
  db.none( sql, [book.title, book.publication_date, book.description, book.img_url])
}

const generateBooks = () => {
  for (let i = 0; i < 70; i++){
    fakeBooks({
      title: faker.lorem.words(),
      publication_date: faker.date.past(),
      description: faker.lorem.paragraph(),
      img_url: faker.image.cats()
    })
  }
}

const findBooks = () => {
  const sql = 'SELECT * FROM book'
  return db.any( sql )
}

const findAuthors = () => {
  const sql = 'SELECT * FROM author'
  return db.any( sql )
}

const bookAuthors = (ids) => {
  const sql = 'INSERT INTO book_author (book_id, author_id) VALUES ( $1, $2 )'

  db.any( sql, [ ids.book_id, ids.author_id])
}

const generateBookAuthors = () => {
  findBooks().then( books => {
    Promise.resolve( findAuthors() )
      .then( authors => {
        const queries = []

        for( let i = 0; i < 80; i++ ) {
          queries.push(
            bookAuthors({
              book_id: faker.random.arrayElement( books ).id,
              author_id: faker.random.arrayElement( authors ).id
            })
          )
        }

        Promise.all( queries )
      })
  })
}

module.exports = {
  generateAuthors, generateBooks, generateBookAuthors
}
