# --- First database schema
 
# --- !Ups


delete from shoppingitem;

INSERT INTO shoppingitem (name,description,ispurchased)
            values ('Tea','Red label',false);
INSERT INTO shoppingitem (name,description,ispurchased)
            values ('Milk','2l semi skimmed',false);
INSERT INTO shoppingitem (name,description,ispurchased)
            values ('Bread','Wholemeal. Medium sliced',false);
INSERT INTO shoppingitem (name,description,ispurchased)
            values ('Bananas','bunch of 3',false);

# --- !Downs
 
delete from shoppingitem;