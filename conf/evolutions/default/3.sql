# --- First database schema
 
# --- !Ups

DELETE FROM shoppingitem
    WHERE itemname like '%mango lots%';


# --- !Downs
