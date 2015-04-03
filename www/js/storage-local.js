
var ShopRepository = function(){

   this.initializeOnEveryLoad = false;

   this.factory = new ShopFactory();

   this.keys = {
      listKeys : "listKeys",
      itemKeys : "itemKeys",
      lists    : function(listId){
         return "list." + listId;
      },
      items    : function(itemId){
         return "item." + itemId;
      }
   }

   this.recentItems   = {};
   this.frequentItems = {};

   this.initialize = function(stubLists,stubItems){

      this.initializeStoredArray(this.keys.listKeys);
      this.initializeStoredArray(this.keys.itemKeys);

      this.storeLists(stubLists)
      this.storeItems(stubItems)

      var notOnLists = this.findNotOnLists();
      for(var key in notOnLists){
         this.addRecentItems(key,notOnLists[key])
         this.addFrequentItems(key,notOnLists[key])
      }
   }

   this.initializeStoredArray = function(objectName){
      if(!this.getStoredObject(objectName) || this.initializeOnEveryLoad){
         var object = JSON.stringify([]);
         this.storeObject(objectName,object)
      }
   }

   this.getStoredObject = function(objectName){
      var data = JSON.parse(localStorage.getItem(objectName));
      if ( data === "[]"){
         return [];
      } else if ( data === "{}"){
         return {};
      } else {
         return data;
      }
   }

   this.storeObject = function(objectName,data){
      try {
         var dataString = JSON.stringify(data);
         localStorage.setItem(objectName, dataString);
      } catch (e) {          
         if (e === "QUOTA_EXCEEDED_ERR") {
            console.log("Quota exceeded!"); 
         } else {
            console.log("Storing error: "+ e); 
            console.log("Storing error key "+ objectName); 
         }
      }
   }

   this.storeLists = function(listsToStore){
      var listKeys = this.getStoredObject(this.keys.listKeys);
      for(var i = 0, len = listsToStore.length; i < len; i++){
         listKeys.push( listsToStore[i].id );
         this.storeList(listsToStore[i]);
      }
      this.storeObject(this.keys.listKeys,listKeys);
   }

   this.storeList = function(list){
      if(list.parent){
         list.parentId = list.parent.id;
         list.parent = null;
      }
      list.items = null;
      this.storeObject(this.keys.lists(list.id),list);
   }

   this.updateStoredList = function(list) {
      this.storeList(list);
   }

   this.storeItems = function(itemsToStore){
      var itemKeys = this.getStoredObject(this.keys.itemKeys);
      for(var i=0, len=itemsToStore.length; i < len; i++){
         itemKeys.push( itemsToStore[i].id );
         this.storeItem(itemsToStore[i]);
      }
      this.storeObject(this.keys.itemKeys,itemKeys);
   }

   this.storeItem = function(item){
      if(item.parent){
         item.parentId = item.parent.id;
         item.parent = null;
      }
      this.storeObject(this.keys.items(item.id),item);
   }

   this.updateStoredItem = function(item) {
      this.storeItem(item);
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
      var listKeys = this.getStoredObject(this.keys.listKeys);
      var itemKeys = this.getStoredObject(this.keys.itemKeys);
      for(var key in listKeys){
         var orphaned = [];
         for( var subKey in listKeys){
            var subList = this.findList(subKey);
            if(subList && subList.parentId == key){
              if(!subList.isOnList()){
                  orphaned.push(subList);
              }
            }
         }
         for(var itemKey in itemKeys){
            var item = this.findItem(itemKey);
            if(item && item.parentId == key){
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
         return el.parent === parent || el.parentId === parent.id;
      });
   }

   this.findParentlessListIds = function(){
      var self = this;
      var listKeys = this.getStoredObject(this.keys.listKeys);
      return listKeys.filter(function(el,i){        
         var list = self.findList(el);     
         return list && list.parentId === null;
      });
   }

   this.findRawList = function(listId){
      var list = this.getStoredObject(this.keys.lists(listId));
         if(list){
         var hydrateList = new ShoppingList(
            list.id,
            list.title,
            list.description,
            list.quantity,
            list.lastSynced,
            []
         );
         hydrateList.itemIds  = list.itemIds;
         hydrateList.parentId = list.parentId;
         return hydrateList;
      }
   }

   this.findList = function(listId,parent){
      // console.log("Looking for list " + this.keys.lists(listId));
      var list = this.findRawList(listId);
      if(list){ 
         if(!parent && list.parentId){
           parent = this.findList(list.parentId);               
         }
         if(parent){
            list.setAsParent(list);
         }     
         for(var i = 0, len = list.itemIds.length; i < len; i++){      
            var item = this.findItem(list.itemIds[i],list);
            if(item){
               list.addItem(item);
            } else {
               var subList = this.findList(list.itemIds[i],list);
               if(subList){
                  list.addItem(subList);
               }
            }
         }
         return list;
      }
   }

   this.findRawItem = function(itemId){
      var item = this.getStoredObject(this.keys.items(itemId));
      if(item){
         var hydrateItem = new ShoppingItem(
            item.id,
            item.title,
            item.description,
            item.quantity,
            item.lastSynced,
            null         
         ); 
         hydrateItem.parentId = item.parentId;
         return hydrateItem;
      }
   }

   this.findItem = function(itemId,list){
      // console.log("Looking for item " + this.keys.items(itemId));
      var item = this.findRawItem(itemId);
      if(item){
         if(!list && item.parentId){
           list = this.findList(item.parentId);               
         }
         if(list){
            item.setAsParent(list);
         }
         return item;
      }
   }

   this.findDefaultListId = function(){
      var parentLessListIds = this.findParentlessListIds();
      if(parentLessListIds.length>0){
         return parentLessListIds[0];
      } else {
         console.log("No default list");
      }
   }

   this.addNewItem = function(list,item){
      var itemKeys = this.getStoredObject(this.keys.itemKeys);
      itemKeys.push( item.id );
      this.storeObject(this.keys.itemKeys, itemKeys);
      this.storeObject(this.keys.items(item.id), item);
      this.addItem(list,item);
   }

   this.addItem = function(list,item){
      var localList = this.findList(list.id);
      if(localList != null){
         var localItem = this.findItem(item.id);
         if(localItem != null){
            localList.addItem(localItem);
            this.updateStoredList(localList);
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
            this.updateStoredItem(localItem);
         } 
      }
   }

   this.updateSubList = function(list,subList){
      var localList = this.findList(list.id);
      if(localList != null){
         var localSubList = this.findList(subList.id);
         if(localSubList != null){
            this.updateStoredList(localSubList);
         }
      }
   }
   
   this.convertToSubList = function(list,item,subList){       
      this.removeItem(list,item);
      this.storeList(subList);
      this.addSubList(list,subList);
   }
   
   this.removeItem = function(list,item){
      var localList = this.findList(list.id);
      if(localList != null){
         var localItem = this.findItem(item.id);
         if(localItem != null){
            localList.removeItem(localItem);
            this.updateItem(localItem);
            this.updateList(localList);
            // var items = localList.items.filter(function(element,i){
            //    return element.id !== localItem.id;
            // });
            // localList.items = items;
            return localList;
         }
      }
   }
   
   this.removeSubList = function(list,subList){
      var localList = this.findList(list.id);
      if(localList != null){
         var localSubList = this.findList(subList.id);
         if(localSubList != null){
            localList.removeItem(localSubList);
            this.updateSubList(localList,localSubList);
            this.updateList(localList);
            // var items = localList.items.filter(function(element,i){
            //    return element.id !== localSubList.id;
            // });
            // localList.items = items;
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

   this.findAllLists = function(){
      var listIds = this.getStoredObject(this.keys.listKeys);
      return $.map(listIds,function(id,i){
         return this.findList(id);
      });
   }
   
   this.searchForLists = function(lists,searchTerm){
      return this.objectToArray(lists).filter(function(element,i){
         if(element.parent && element.parent.id == list.id){
            if(element.title.toLowerCase().indexOf(searchTerm) > -1){
               return true;
            } else if(element.description && element.description.toLowerCase().indexOf(searchTerm) > -1){
               return true;
            }
         }
         return false;
      });
   }

   this.findListItems = function(){
      var items = $.map(list.itemIds,function(id,i){
         return this.findItem(id);
      });
   }
   
   this.searchForListItems = function(list,searchTerm){
      var items = this.findListItems(list);
      return this.objectToArray(items).filter(function(element,i){
         if(element.parent && element.parent.id == list.id){
            if(element.title.toLowerCase().indexOf(searchTerm) > -1){
               return true;
            } else if(element.description && element.description.toLowerCase().indexOf(searchTerm) > -1){
               return true;
            }
         }
         return false;
      });
   }

   this.searchForItems = function(list,searchTerm){
      var lists = this.findAllLists();
      var searchLists = this.searchForLists(lists,searchTerm);
      var searchItems = [];
      for(list in lists){
         var items = this.searchForListItems(list,searchTerm);
         searchItems.concat(items);
      }
      return searchLists.concat(searchItems);
   }

}

