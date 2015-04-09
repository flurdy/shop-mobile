
var ShopRepository = function(){

   this.initializeOnEveryLoad = true;

   this.factory = new ShopFactory();

   this.keys = {
      listKeys : "listKeys",
      itemKeys : "itemKeys",
      lists    : function(listId){
         return "list." + listId;
      },
      items    : function(itemId){
         return "item." + itemId;
      },
      recentKeys   : function(listId){
         return "recentKeys." + listId;
      },
      frequentKeys : function(listId){
         return "frequentKeys." + listId;
      }
   }

   this.initialize = function(stubLists,stubItems){

      if(this.initializeOnEveryLoad){
         localStorage.clear();
      }

      this.initializeStoredArray(this.keys.listKeys);
      this.initializeStoredArray(this.keys.itemKeys);

      this.storeItems(stubItems)
      this.storeLists(stubLists)

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

   this.initializeStoredObject = function(objectName){
      if(!this.getStoredObject(objectName) || this.initializeOnEveryLoad){
         var object = JSON.stringify({});
         this.storeObject(objectName,object)
      }
   }

   this.getStoredObject = function(objectName){
      var rawData = localStorage.getItem(objectName);
      if(rawData === "undefined" || rawData === undefined){
         return null;
      } else if ( rawData === "[]" || rawData === "\"[]\""){
         return [];
      } else if ( rawData === "{}" || rawData === "\"{}\""){
         return {};
      } else {
         return JSON.parse(rawData);
      }
   }

   this.storeObject = function(objectName,data){
      try {
         if(data){
            var dataString = JSON.stringify(data);
            localStorage.setItem(objectName, dataString);
         } else {
            throw new Error("Can not store undefined object " + objectName);
         }
      } catch (e) {          
         if (e === "QUOTA_EXCEEDED_ERR") {
            console.log("Quota exceeded!"); 
         } else {
            console.log("Storing error: "+ e); 
            console.log("Storing error key "+ objectName); 
         }
      }
   }

   this.removeStoredObject = function(objectName){
      try {
         localStorage.removeItem(objectName);
      } catch (e) {          
         if (e === "QUOTA_EXCEEDED_ERR") {
            console.log("Quota exceeded!"); 
         } else {
            throw e;
         }
      }
   }

   this.findStoredListKeys = function(){
      var listKeys = this.getStoredObject(this.keys.listKeys);      
      if(!listKeys){
         listKeys = [];
      }
      return listKeys;
   }

   this.storeListKeys = function(listKeys){
      this.storeObject(this.keys.listKeys,listKeys);
   }

   this.storeLists = function(listsToStore){
      var listKeys = this.findStoredListKeys();
      for(var i = 0, len = listsToStore.length; i < len; i++){
         listKeys.push( listsToStore[i].id );
         this.storeList(listsToStore[i]);
      }
      this.storeListKeys(listKeys);
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
      var itemKeys = this.findStoredItemKeys();    
      for(var i=0, len=itemsToStore.length; i < len; i++){
         itemKeys.push( itemsToStore[i].id );
         this.storeItem(itemsToStore[i]);
      }
      this.storeItemKeys(itemKeys);
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

   this.findStoredItemKeys = function(){
      var itemKeys = this.getStoredObject(this.keys.itemKeys);
      if(!itemKeys){
         itemKeys = [];
      }
      return itemKeys;
   }

   this.storeItemKeys = function(itemKeys){
      this.storeObject(this.keys.itemKeys,itemKeys);
   }

   this.deleteStoredItem = function(item){
      if(item.isOnList()){
         item.parent.removeItem(this);
         item.parent   = null
         item.parentId = null;
      }
      this.removeStoredObject(this.keys.items(item.id));
      var itemKeys = this.findStoredItemKeys();      
      itemKeys.splice($.inArray(item.id,itemKeys), 1);
      this.storeItemKeys(itemKeys);
   }

   this.isItemId = function(itemId){
      return this.existsInArray(this.findStoredItemKeys(),itemId);
   }

   this.isListId = function(listId){
      return this.existsInArray(this.findStoredListKeys(),listId);
   }

   this.existsInArray = function(array,id){
      for(var i = 0, len = array.length; i < len; i++){  
         if(array[i] == id){
            return true;
         }      
      }
      return false;
   }    

   this.existsInItemArray = function(itemArray,id){
      for(var i = 0, len = itemArray.length; i < len; i++){  
         if(itemArray[i].id == id){
            return true;
         }      
      }
      return false;
   }    

   this.findInArray = function(itemArray,id){
      for(var i = 0, len = itemArray.length; i < len; i++){  
         if(itemArray[i].id == id){
            return itemArray[i];
         }
      }
      return null;
   }

   this.findRecentKeys = function(listId){
      var recentKeys = this.getStoredObject(this.keys.recentKeys(listId));
      if(!recentKeys){
         recentKeys = [];
      } 
      return recentKeys;
   }

   this.addRecentItems = function(listId,items){
      var recentKeys = this.findRecentKeys(listId);
      for(var itemIndex in recentKeys){
         this.addRemoveRecentItemWithKeys(recentKeys,items[itemIndex]);
      }
      this.storeObject(this.keys.recentKeys(listId),recentKeys);
   }

   this.addRemoveRecentItemWithKeys = function(recentKeys,item){
      if( this.existsInItemArray(recentKeys,item.id)){
         var recentItem = this.findInArray(recentKeys,item.id);
         recentItem.addAgain();
      } else {
         recentKeys.push(new RecentItem(item));
      }
   }

   this.addRemoveRecentItem = function(list,item){
      var localList = this.findList(list.id);
      if(localList != null){
         var localItem = this.findItem(item.id);
         if(localItem != null){
            var recentKeys = this.findRecentKeys(list.id);
            this.addRemoveRecentItemWithKeys(recentKeys,localItem.id);
            this.storeObject(this.keys.recentKeys(list.id),recentKeys);
         }
      }
   }

   this.findFrequentKeys = function (listId){
      var frequentKeys = this.getStoredObject(this.keys.frequentKeys(listId));
      if(!frequentKeys){
         frequentKeys = [];
      } 
      return frequentKeys;
   }

   this.addFrequentItems = function(listId,items){
      var frequentKeys = this.findFrequentKeys();
      for(var itemIndex in items){
         this.addOrIncrementFrequentItemFromKeys(frequentKeys,items[itemIndex])
      }
      this.storeObject(this.keys.frequentKeys(listId),frequentKeys);
   }

   this.addOrIncrementFrequentItemFromKeys = function(frequentKeys,item){
      if( this.existsInArray(frequentKeys,item.id)){
         var frequentItem = this.findInArray(frequentKeys,item.id);
         frequentItem.increment();
      } else {
         frequentKeys.push(new FrequentItem(item));
      }
   }
 
   this.addOrIncrementFrequentItem = function(list,item){
      var localList = this.findList(list.id);
      if(localList != null){
         var localItem = this.findItem(item.id);
         var localItem = this.findItem(item.id);
         if(localItem != null){
            var frequentKeys = this.findFrequentKeys(list.id);
            this.addOrIncrementFrequentItemFromKeys(frequentKeys,item.id)
            this.storeObject(this.keys.frequentKeys(list.id),frequentKeys);
         }
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
         return this.factory.cloneList(list);
      }
   }

   this.findList = function(listId,parent){
      // console.log("Looking for list " + this.keys.lists(listId));
      var list = this.findRawList(listId);
      if(list){ 
         if(!parent && !list.parent && list.parentId){
            parent = this.findList(list.parentId); 
         }
         if(!list.parent && parent){
            list.setAsParent(parent);
         }     
         if(!list.itemIds){
            list.itemIds = [];
         }
         for(var i = 0, len = list.itemIds.length; i < len; i++){      
            if(!list.hasItem(list.itemIds[i])){
               if(this.isItemId(list.itemIds[i])){
                  var item = this.findItem(list.itemIds[i],list);
                  if(item){
                     list.addItem(item);
                  }
               } else if(this.isListId(list.itemIds[i])){
                  var subList = this.findList(list.itemIds[i],list);
                  if(subList){
                     list.addItem(subList);
                  }
               }
            }
         }
         return list;
      }
   }

   this.findRawItem = function(itemId){
      var item = this.getStoredObject(this.keys.items(itemId));
      if(item){
         return this.factory.cloneItem(item);
      }
   }

   this.findItem = function(itemId,list){
      // console.log("Looking for item " + this.keys.items(itemId));
      var item = this.findRawItem(itemId);
      if(item){
         if(!list && !item.parent && item.parentId){
           list = this.findList(item.parentId);               
         }
         if(!item.parent && list){
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
      var itemKeys = this.findStoredItemKeys();
      itemKeys.push( item.id );
      this.storeItem(item);
      this.storeItemKeys(itemKeys);
      this.addItem(list,item);
   }

   this.addItem = function(list,item){
      var localList = this.findList(list.id);
      if(localList != null){
         var localItem = this.findItem(item.id);
         if(localItem != null){
            localList.addItem(localItem);
            this.updateStoredItem(localItem);
            this.updateStoredList(localList);
         }
      }
   }

   this.addNewSubList = function(list,subList){
      console.log("Add  new sublist " + subList.logString());
      var localList = this.findList(list.id);
      if(localList != null){
         var listKeys = this.findStoredListKeys();
         listKeys.push( subList.id );
         this.storeList(subList);
         this.storeListKeys(listKeys);
         this.addSubList(localList,subList);
      }
   }

   this.addSubList = function(list,subList){
      var localList = this.findList(list.id);
      if(localList != null){
         var localSubList = this.findList(subList.id);
         if(localSubList != null){
            localList.addItem(localSubList);
            this.updateStoredList(localSubList);
            this.updateStoredList(localList);
         }
      }
   }
   
   this.updateItem = function(list,item){
      var localList = this.findList(list.id);
      if(localList != null){
         var localItem = this.findItem(item.id);
         if(localItem != null){
            this.updateStoredItem(item);
         } 
      }
   }

   this.updateSubList = function(list,subList){
      var localList = this.findList(list.id);
      if(localList != null){
         var localSubList = this.findList(subList.id);
         if(localSubList != null){
            this.updateStoredList(subList);
         }
      }
   }

   this.updateList = function(list){
      var localList = this.findList(list.id);
      if(localList != null){
         this.updateStoredList(list);
      }
   }
   
   this.deleteItem = function(list,item){
      console.log("Deleting item " + item.logString());
      this.removeItem(list,item);
      this.deleteStoredItem(item);
   }
   
   this.removeItem = function(list,item){
      console.log("Remove item " + item.logString());
      var localList = this.findList(list.id);
      if(localList != null){
         var localItem = this.findItem(item.id);
         if(localItem != null){
            localList.removeItem(localItem);
            this.updateStoredItem(localItem);
            this.updateStoredList(localList);
            return localList;
         }
      }
   }
   
   this.removeSubList = function(list,subList){
      console.log("Remove sublist " + item.logString());
      var localList = this.findList(list.id);
      if(localList != null){
         var localSubList = this.findList(subList.id);
         if(localSubList != null){
            localList.removeItem(localSubList);
            this.updateStoredList(localSubList);
            this.updateStoredList(localList);
            return localList;
         }
      }
   }
   
   this.findRecentItems = function(list){
      return this.getStoredObject(this.keys.recentKeys(list.id));
   }
   
   this.findFrequentItems = function(list){
      return this.getStoredObject(this.keys.frequentKeys(list.id));
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


   this.addRecentItem = function(list,item){
      var localList = this.findList(list.id);
      if(localList != null){
         var localItem = this.findItem(item.id);
         if(localItem != null){
            this.addRemoveRecentItem(localList,localItem);
         }
      }
   }

}

