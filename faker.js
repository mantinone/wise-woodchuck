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
      name: `${faker.name.firstName()} ${faker.name.lastName()}`
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
      title: faker.random.catch_phrase_noun()
      publication_date: faker.date.past()
      description: faker.lorem.paragraph(),
      img_url: faker.image.abstractImage()
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
