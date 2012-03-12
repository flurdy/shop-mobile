# --- First database schema
 
# --- !Ups

CREATE TABLE shopper (
  username                VARCHAR(255) NOT NULL PRIMARY KEY,
  password                VARCHAR(255)
);

CREATE TABLE shoppinglist (
  id                     SERIAL PRIMARY KEY,
  username                VARCHAR(255) NOT NULL ,
 foreign key(username)   references shopper(username) on delete cascade
);

-- CREATE SEQUENCE shoppinglist_seq start WITH 1000;

CREATE TABLE shoppingitem (
  id                  SERIAL PRIMARY KEY,
  itemname            VARCHAR(255) NOT NULL,
  description          text,
  ispurchased          boolean NOT NULL,
  listid               bigint NOT NULL    ,
 foreign key(listid)   references shoppinglist(id) on delete cascade
);

-- CREATE SEQUENCE shoppingitem_seq start WITH 1000;

CREATE INDEX ix_shoppingitem_1 ON shoppingitem (itemname);


# --- !Downs

--  DROP INDEX IF EXISTS ix_shoppingitem_1;
DROP TABLE IF EXISTS shoppingitem;
--  DROP SEQUENCE if exists shoppingitem_seq;
DROP TABLE IF EXISTS shoppinglist;
-- DROP SEQUENCE if exists shoppinglist_seq;
DROP TABLE IF EXISTS shopper;