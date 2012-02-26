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

-- ##  listId            bigint(20) NOT NULL,
-- ##  FOREIGN KEY (listId) REFERENCES ShoppingList(id),

# --- !Downs
 
DROP TABLE IF EXISTS shoppingitem;
DROP TABLE IF EXISTS shoppinglist;