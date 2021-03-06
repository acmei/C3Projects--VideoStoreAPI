"use strict";

var sqlite3 = require('sqlite3').verbose(),
    db_env = process.env.DB || 'development',
    db = new sqlite3.Database('db/' + db_env + '.db');

var movies = require('./movies');
var movie_statement = db.prepare(
  "INSERT INTO movies (title, overview, inventory, release_date) \
  VALUES (?, ?, ?, ?);"
);

var customers = require('./customers');
var customer_statement = db.prepare(
  "INSERT INTO customers (name, registered_at, address, city, state, \
  postal_code, phone, account_credit) VALUES (?, ?, ?, ?, ?, ?, ?, ?);"
);

var rentals = require('./rentals');
var rental_statement = db.prepare(
  "INSERT INTO rentals(customer_id, movie_id, checkout_date, due_date, returned_date) \
  VALUES (?, ?, ?, ?, ?);"
  );

db.serialize(function() {
  // loop thru movies
  for (var i = 0; i < movies.length; i++) {
    var movie = movies[i];

    // insert each one into the db
    movie_statement.run(
      movie.title, 
      movie.overview, 
      movie.inventory, 
      movie.release_date
    );
  }

  movie_statement.finalize();

  for (var i = 0; i < customers.length; i++) {
    var customer = customers[i];

    customer_statement.run(
      customer.name, 
      customer.registered_at, 
      customer.address,
      customer.city, 
      customer.state,
      customer.postal_code, 
      customer.phone,
      customer.account_credit * 100 // convert for storage as integer
    );
  }

  customer_statement.finalize();

  for (var i = 0; i < rentals.length; i++) {
    var rental = rentals[i];

    rental_statement.run(
      rental.customer_id,
      rental.movie_id,
      rental.checkout_date,
      rental.due_date,
      rental.returned_date
    );
  }

  rental_statement.finalize();
});

db.close();
