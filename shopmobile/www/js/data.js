
var item1 = new ShoppingItem(10,
   "Milk","Semi skimmed 4 litre",1,"2015-01-21 12:02:12",false,false,false);
var item2 = new ShoppingItem(11,
   "Bread","Wholemeal",0,"2015-01-21 12:02:12",false,false,false);
var item3 = new ShoppingItem(12,
   "Ice cream","All the flavours",3,"2015-01-21 12:02:12",false,false,false);
var item4 = new ShoppingItem(13,
   "Lasagne","Family size",1,"2015-01-21 12:02:12",false,false,false);
var item5 = new ShoppingItem(14,
   "Garlic bread","",2,"2015-01-21 12:02:12",false,false,false);
var item6 = new ShoppingItem(15,
   "Salad","Rocket and co",1,"2015-01-21 12:02:12",false,false,false);
var item7 = new ShoppingItem(16,
   "Ketchup","",1,"2015-01-21 12:02:12",false,false,false);
var item8 = new ShoppingItem(17,
   "Toilet roll","",1,"2015-01-21 12:02:12",false,false,false);
var item9 = new ShoppingItem(18,
   "Eggs","",12,"2015-01-21 12:02:12",false,false,false);
var item10 = new ShoppingItem(19,
   "Tortellini","",2,"2015-01-21 12:02:12",false,false,false);
var item11 = new ShoppingItem(20,
   "Dr Ötker Supreme","",1,"2015-01-21 12:02:12",false,false,false);
var item12 = new ShoppingItem(21,
   "Dr Ötker Mozzarella","",1,"2015-01-21 12:02:12",false,false,false);
var item13 = new ShoppingItem(22,
   "Dr Ötker Hawaiian","",1,"2015-01-21 12:02:12",false,false,false);


var subList1 = new ShoppingList(
   41, "Lasagne Dinner", "", 1, "2015-01-21 12:02:12", 
   [item4,item5,item6] );

var subList3 = new ShoppingList(
   44, "Pizzas", "", 1, "2015-01-21 12:02:12", 
   [item11,item12,item13] );

var subList2 = new ShoppingList(
   43, "Dinner", "Possible dinners", 1, "2015-01-21 12:02:12", 
   [subList1,item10,subList3] );
subList1.parent = subList2;
subList3.parent = subList2;

var list1 = new ShoppingList(
   42, "Groceries", "", 1, "2015-01-21 12:02:12", 
   [item1,item2,item3,subList2] );
subList2.parent = list1;

var items = [item1,item2,item3,item4,item5,item6,item7,item8,item9,item10,item11,item12,item13];
var lists = [list1,subList1,subList2,subList3];
