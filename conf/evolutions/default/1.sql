# --- First database schema
 
# --- !Ups

CREATE TABLE shoppinglist (
  id                   SERIAL PRIMARY KEY,
);

CREATE TABLE shoppingitem (
  name                VARCHAR(255) NOT NULL PRIMARY KEY,
  description          text,
  ispurchased          boolean NOT NULL
);


# --- !Downs
 
DROP TABLE IF EXISTS shoppingitem;
DROP TABLE IF EXISTS shoppinglist;