# --- First database schema
 
# --- !Ups

DELETE FROM shopper;
INSERT INTO shopper (username,password) VALUES ('testuser','');
INSERT INTO shopper (username,password) VALUES ('otheruser','');

DELETE FROM shoppinglist;
INSERT INTO shoppinglist (username) VALUES ('testuser');

DELETE FROM shoppingitem;
 INSERT INTO shoppingitem (itemname,description,ispurchased,listid)
            VALUES ('Tea','Red label',false,(select max(id) from shoppinglist));
 INSERT INTO shoppingitem (itemname,description,ispurchased,listid)
            VALUES ('Milk','2l semi skimmed',false,(select max(id) from shoppinglist));
 INSERT INTO shoppingitem (itemname,description,ispurchased,listid)
            VALUES ('Bread','Wholemeal. Medium sliced',false,(select max(id) from shoppinglist));
 INSERT INTO shoppingitem (itemname,description,ispurchased,listid)
            VALUES ('Bananas','bunch of 3',false,(select max(id) from shoppinglist));

INSERT INTO shoppinglist (username) VALUES ('otheruser');


# --- !Downs
 
DELETE FROM shoppingitem;
DELETE FROM shoppinglist;
DELETE FROM shopper;