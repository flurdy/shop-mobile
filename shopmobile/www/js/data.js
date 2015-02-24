
var item1 = new ShoppingItem(10,"Milk","Semi skimmed 4 litre",1,"2015-01-21 12:02:12");
var item2 = new ShoppingItem(11,"Bread","Wholemeal",0,"2015-01-21 12:02:12");
var item3 = new ShoppingItem(12,"Ice cream","All the flavours",3,"2015-01-21 12:02:12");
var item4 = new ShoppingItem(13,"Lasagne","Family size",1,"2015-01-21 12:02:12");
var item5 = new ShoppingItem(14,"Garlic bread","",2,"2015-01-21 12:02:12");
var item6 = new ShoppingItem(15,"Salad","Rocket and co",1,"2015-01-21 12:02:12");
var item7 = new ShoppingItem(16,"Ketchup","",1,"2015-01-21 12:02:12");
var item8 = new ShoppingItem(17,"Toilet roll","",1,"2015-01-21 12:02:12");
var item9 = new ShoppingItem(18,"Eggs","",12,"2015-01-21 12:02:12");
var item10 = new ShoppingItem(19,"Tortellini","",2,"2015-01-21 12:02:12");
var item11 = new ShoppingItem(20,"Dr Ötker Supreme","",1,"2015-01-21 12:02:12");
var item12 = new ShoppingItem(21,"Dr Ötker Mozzarella","",1,"2015-01-21 12:02:12");
var item13 = new ShoppingItem(22,"Dr Ötker Hawaiian","",1,"2015-01-21 12:02:12");
var item14 = new ShoppingItem(23,"Pasta","Twirlies",1,"2015-01-21 12:02:12");
var item15 = new ShoppingItem(24,"Cheddar cheese","Pack of 20",1,"2015-01-21 12:02:12");
var item16 = new ShoppingItem(25,"Aptamil formula","2-3 year",1,"2015-01-21 12:02:12");


var subList1 = new ShoppingList(
   41, "Lasagne Dinner", "", 1, "2015-01-21 12:02:12", 
   [item4,item5,item6] );
subList1.setAsItemsParent();

var subList3 = new ShoppingList(
   44, "Pizzas", "", 1, "2015-01-21 12:02:12", 
   [item11,item12,item13] );
subList3.setAsItemsParent();

var subList2 = new ShoppingList(
   43, "Dinner", "Possible dinners", 1, "2015-01-21 12:02:12", 
   [subList1,item10,subList3] );
subList2.setAsItemsParent();

var list1 = new ShoppingList(
   42, "Groceries", "", 1, "2015-01-21 12:02:12", 
   [item1,item2,item3,subList2,item14,item15,item16] );
list1.setAsItemsParent();

item7.parent = list1;
item8.parent = list1;
item9.parent = list1;

var items = [item1,item2,item3,item4,item5,item6,item7,item8,item9,item10,item11,item12,item13,item14,item15,item16];
var lists = [list1,subList1,subList2,subList3];

var ShopRepository = function(){
   this.lists = {}
   this.items = {}
   this.recentItems   = {};
   this.frequentItems = {};

   this.initialize = function(stubLists,stubItems){
      this.addToLists(stubLists);
      this.addToItems(stubItems);
      var notOnLists = this.findNotOnLists();
      console.log("not on lists "+notOnLists);
      for(var key in notOnLists){
         console.log("not on lists key "+key);
         this.addRecentItems(key,notOnLists[key])
         this.addFrequentItems(key,notOnLists[key])
      }
   }

   this.existsInArray = function(array,id){
      for(element in array){
         if(array[element].item.id == id){
            return true;
         }
      }
      return false;
   }    

   this.findInArray = function(array,id){
      for(element in array){
         if(array[element].item.id == id){
            return array[element];
         }
      }
      return null;
   }

   this.addRecentItems = function(listId,items){
      if(!this.recentItems[listId]){
         this.recentItems[listId] = [];
      } 
      for(var itemIndex in items){
         if( this.existsInArray(this.recentItems[listId],items[itemIndex].id)){
            var recentItem = this.findInArray(this.recentItems[listId],items[itemIndex].id);
            recentItem.addAgain();
         } else {
            this.recentItems[listId].push(new RecentItem(items[itemIndex]));
         }
      }
   }

   this.addFrequentItems = function(listId,items){
      if(!this.frequentItems[listId]){
         this.frequentItems[listId] = [];
      } 
      for(var itemIndex in items){
         this.addFrequentItem(listId,items[itemIndex])
      }
   }

   this.addFrequentItem = function(listId,item){
      if( this.existsInArray(this.frequentItems[listId],item.id)){
         var frequentItem = this.findInArray(this.frequentItems[listId],item.id);
         frequentItem.increment();
      } else {
         this.frequentItems[listId].push(new FrequentItem(item));
      }
   }

   this.findNotOnLists = function(){
      var notOnLists = {};
      for(var key in this.lists){
         var orphaned = [];
         for( var subKey in this.lists ){
            var subList = this.lists[subKey];
            if(subList.parent && subList.parent.id == key){
              if(!subList.isOnList()){
                  orphaned.push(subList);
              }
            }
         }
         for(var itemKey in this.items){
            var item = this.items[itemKey];
            if(item.parent && item.parent.id == key){
              if(!item.isOnList()){
               orphaned.push(item);
              }
           }
         }
         notOnLists[key] = orphaned;
      }
      return notOnLists;
   }

   this.findIsParent = function(items,parent){
      return items.filter(function(el,i){
         return el.parent === parent;
      });
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
            this.addRemoveRecentItem(localList,localItem);
            this.addFrequentItem(localList.id,localItem);
         }
      }
   }

   this.addRemoveRecentItem = function(localList,localItem){
      var items = this.recentItems[localList.id].filter(function(element,i){
         return element.item.id !== localItem.id;
      });
      items.push(new RecentItem(localItem));
      this.recentItems[localList.id] = items;
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
            this.recentItems[localList.id].push(localSubList);
            this.frequentItems[localList.id].push(localSubList);
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
   
   this.findRecentItems = function(list){
      return this.recentItems[list.id];  
   }
   
   this.findFrequentItems = function(list){
      return this.frequentItems[list.id];  
   }

   this.objectToArray = function(object){
      var array = [];
      for(key in object){
         array.push(object[key]);
      }
      return array;
   }
   
   this.searchForItems = function(list,searchTerm){
      var searchLists = this.objectToArray(this.lists).filter(function(element,i){
         if(element.parent && element.parent.id == list.id){
            if(element.title.toLowerCase().indexOf(searchTerm) > -1){
               return true;
            } else if(element.description && element.description.toLowerCase().indexOf(searchTerm) > -1){
               return true;
            }
         }
         return false;
      });
      var searchItems = this.objectToArray(this.items).filter(function(element,i){
         if(element.parent && element.parent.id == list.id){
            if(element.title.toLowerCase().indexOf(searchTerm) > -1){
               return true;
            } else if(element.description && element.description.toLowerCase().indexOf(searchTerm) > -1){
               return true;
            }
         }
         return false;
      });
      return searchLists.concat(searchItems);
   }

}

var RecentItem = function(itemOrList){
   this.lastAdded = new Date();
   this.item = itemOrList;
   this.addAgain = function(){
      this.lastAdded = new Date();
   }
}

var FrequentItem = function(itemOrList){
   this.frequency = 0;
   this.item = itemOrList;
   this.increment = function(){
      this.frequency = this.frequency + 1;
   }
}


