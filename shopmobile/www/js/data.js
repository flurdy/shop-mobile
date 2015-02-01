
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
var item14 = new ShoppingItem(23,
   "Pasta","Twirlies",1,"2015-01-21 12:02:12",false,false,false);
var item15 = new ShoppingItem(24,
   "Cheddar cheese","Pack of 20",1,"2015-01-21 12:02:12",false,false,false);
var item16 = new ShoppingItem(25,
   "Aptamil formula","2-3 year",1,"2015-01-21 12:02:12",false,false,false);


var subList1 = new ShoppingList(
   41, "Lasagne Dinner", "", 1, "2015-01-21 12:02:12", 
   [item4,item5,item6] );
item4.parent = subList1;
item5.parent = subList1;
item6.parent = subList1;

var subList3 = new ShoppingList(
   44, "Pizzas", "", 1, "2015-01-21 12:02:12", 
   [item11,item12,item13] );
item11.parent = subList3;
item12.parent = subList3;
item13.parent = subList3;

var subList2 = new ShoppingList(
   43, "Dinner", "Possible dinners", 1, "2015-01-21 12:02:12", 
   [subList1,item10,subList3] );
subList1.parent = subList2;
subList3.parent = subList2;
item10.parent = subList2;

var list1 = new ShoppingList(
   42, "Groceries", "", 1, "2015-01-21 12:02:12", 
   [item1,item2,item3,subList2,item14,item15,item16] );
subList2.parent = list1;
item1.parent = list1;
item2.parent = list1;
item3.parent = list1;
subList2.parent = list1;
item14.parent = list1;
item15.parent = list1;
item16.parent = list1;

item7.parent = list1;
item8.parent = list1;
item9.parent = list1;

var items = [item1,item2,item3,item4,item5,item6,item7,item8,item9,item10,item11,item12,item13,item14,item15,item16];
var lists = [list1,subList1,subList2,subList3];


var ShopRepository = function(){
   this.lists = {}
   this.items = {}
   this.initialize = function(stubLists,stubItems){
      this.addToLists(stubLists);
      this.addToItems(stubItems);
   }
   this.addToLists = function(newLists){
      this.addToObject(this.lists,newLists);
   }
   this.addToItems = function(newItems){
      this.addToObject(this.items,newItems);
   }
   this.addToObject = function(object,newObjects){      
      for(var i=0, len=newObjects.length; i < len; i++){
         object[newObjects[i].id] = newObjects[i];
      }
   }
   this.findList = function(listId){
      return this.lists[listId];
   }
   this.findItem = function(itemId){
      return this.items[itemId];
   }
   this.findDefaultListId = function(){
      return 42;
   }
   this.addNewItem = function(list,item){
      this.items[item.id] = item;
      this.addItem(list,item);
   }
   this.addItem = function(list,item){
      var localList = this.findList(list.id);
      if(localList != null){
         var localItem = this.findItem(item.id);
         if(localItem != null){
            var items = localList.items.filter(function(element,i){
               return element.id !== localItem.id;
            });
            items.push(item);
            localItem.parent = localList;
            localList.items = items;
         }
      }
   }
   this.addSubList = function(list,subList){
      var localList = this.findList(list.id);
      if(localList != null){
         var localSubList = this.findList(subList.id);
         if(localSubList != null){
            var items = localList.items.filter(function(element,i){
               return element.id !== subList.id;
            });
            items.push(subList);
            subList.parent = localList;
            localList.items = items;
         }
      }
   }
   
   this.updateItem = function(list,item){
      var localList = this.findList(list.id);
      if(localList != null){
         var localItem = this.findItem(item.id);
         if(localItem != null){
            this.items[localItem.id] = item;
            this.addItem(localList,item);
         } 
      }
   }

   this.updateSubList = function(list,subList){
      var localList = this.findList(list.id);
      if(localList != null){
         var localSubList = this.findList(subList.id);
         if(localSubList != null){
            this.lists[localSubList.id] = subList;
            this.addSubList(list,subList);
         }
      }
   }
   
   this.convertToSubList = function(list,item,subList){       
      this.removeItem(list,item);t
      this.items[item.id] = undefined;
      this.lists[subList.id] = subList;
      this.addSubList(list,subList);
   }
   
   this.removeItem = function(list,item){
      var localList = this.findList(list.id);
      if(localList != null){
         var localItem = this.findItem(item.id);
         if(localItem != null){
            var items = localItem.items.filter(function(element,i){
               return element.id !== localItem.id;
            });
            localList.items = items;
            return localList;
         }
      }
   }
   
   this.removeSubList = function(list,item){
      var localList = this.findList(list.id);
      if(localList != null){
         var localSubList = this.findList(subList.id);
         if(localSubList != null){
            var items = localItem.items.filter(function(element,i){
               return element.id !== localSubList.id;
            });
            localList.items = items;
            return localList;
         }
      }
   }

}

