
// var item6  = new ShoppingItem(15,"Salad","Rocket and co",1,"2015-01-21 12:02:12");
// var item8  = new ShoppingItem(17,"Toilet roll","",1,"2015-01-21 12:02:12");
// var item9  = new ShoppingItem(18,"Eggs","",12,"2015-01-21 12:02:12");
// var item16 = new ShoppingItem(25,"Baby milk formula","",1,"2015-01-21 12:02:12");

var factory = new ShopFactory();

var item01 = factory.newItem("Milk", "Semi skimmed 4 litre", 1);
var item02 = factory.newItem("Bread", "Wholemeal", 0);
var item03 = factory.newItem("Ice cream", "All the flavours", 3);
var item04 = factory.newItem("Lasagne", "Family size", 1);
var item05 = factory.newItem("Tortellini", "", 2);
var item06 = factory.newItem("Garlic Bread", "", 2);
var item07 = factory.newItem("Supreme Pizza", "", 1);
var item08 = factory.newItem("Hawaiian Pizza", "", 1);
var item09 = factory.newItem("Margherita Pizza", "Basic tomato pizza", 1);
var item10 = factory.newItem("Cheddar cheese", "Pack of 20", 1);
var item11 = factory.newItem("Ketchup", "Large bottle", 1);
var item12 = factory.newItem("Pasta", "Twirlies", 1);
var item13 = factory.newItem("Sausages", "For BBQ", 6);
var item14 = factory.newItem("Salad", "Baby rocket and lettuce", 1);

var list01 = factory.newList("Groceries", "", 1);
var list02 = factory.newList("Dinners", "Possible dinners", 1);
var list03 = factory.newList("Pizzas", "", 1);
var list04 = factory.newList("Picnic", "Nibblets", 1);

list01.addItem(item01);
list01.addItem(item03);
list01.addItem(item10);
list01.addItem(item11);
list01.addItem(list02);
item02.setAsParent(list01);
item12.setAsParent(list01);
list04.setAsParent(list01);

list02.addItem(item04);
list02.addItem(item05);
list02.addItem(item06);
list02.addItem(list03);

list03.addItem(item07);
list03.addItem(item08);
item09.setAsParent(list03);

list04.addItem(item13);
item14.setAsParent(list04);

var items = [item01,item02,item03,item04,item05,item06,item07,item08,item09,item10,item11,item12,item13,item14];
var lists = [list01,list02,list03,list04];
