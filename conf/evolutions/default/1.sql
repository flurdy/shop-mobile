# --- First database schema
 
# --- !Ups

CREATE TABLE ShoppingList (
  id                   SERIAL PRIMARY KEY,
);
CREATE TABLE ShoppingItem (
  name                VARCHAR(255) NOT NULL PRIMARY KEY,
  description          text,
  isPurchased          boolean NOT NULL
);

-- ##  listId            bigint(20) NOT NULL,
-- ##  FOREIGN KEY (listId) REFERENCES ShoppingList(id),

# --- !Downs
 
DROP TABLE IF EXISTS ShoppingItem;
DROP TABLE IF EXISTS ShoppingList;