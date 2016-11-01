DROP TABLE IF EXISTS book;

CREATE TABLE book (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  publication_date DATE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  img_url VARCHAR(255) NOT NULL DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  price MONEY DEFAULT 0
);

DROP TABLE IF EXISTS author;

CREATE TABLE author (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  img_url VARCHAR(255) NOT NULL DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE
);

DROP TABLE IF EXISTS tag;

CREATE TABLE tag (
  id SERIAL PRIMARY KEY,
  item VARCHAR(255),
  description TEXT NOT NULL DEFAULT ''
);

DROP TABLE IF EXISTS customer;

CREATE TABLE customer (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ship_address VARCHAR(255) NOT NULL,
  password VARCHAR NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  favorite_book INTEGER REFERENCES book(id)
);

DROP TABLE IF EXISTS transaction;

CREATE TABLE transaction (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customer(id),
  order_date DATE NOT NULL,
  total DECIMAL NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

DROP TABLE IF EXISTS book_tag;

CREATE TABLE book_tag (
  tag_id INTEGER REFERENCES tag(id),
  book_id INTEGER REFERENCES book(id)
);

DROP TABLE IF EXISTS book_author;

CREATE TABLE book_author (
  author_id INTEGER REFERENCES author(id),
  book_id INTEGER REFERENCES book(id)
);

DROP TABLE IF EXISTS book_transaction;

CREATE TABLE book_transaction (
  transaction_id INTEGER REFERENCES transaction(id),
  book_id INTEGER REFERENCES book(id)
);
