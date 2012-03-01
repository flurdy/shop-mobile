# --- First database schema
 
# --- !Ups


CREATE TABLE shopper (
  username                VARCHAR(255) NOT NULL PRIMARY KEY,
  password                VARCHAR(255)
);

INSERT INTO shopper (username,password) values ('testuser','');

# --- !Downs
 
DROP TABLE IF EXISTS shopper;