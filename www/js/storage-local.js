
var ShopRepository = function(){

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

   this.initialize = function(initializeOnEveryLoad,stubLists,stubItems){

      if(initializeOnEveryLoad){
         localStorage.clear();
      }

      this.storeListsAndItems(stubLists,stubItems);
      // this.storeItems(stubItems)
      // this.storeLists(stubLists)

      // var notOnLists = this.findNotOnLists();
      // for(var key in notOnLists){
      //    this.addRecentItems(key,notOnLists[key])
      //    this.addFrequentItems(key,notOnLists[key])
      // }
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

   this.storeListsAndItems = function(listsToStore,itemsToStore){
      this.storeLists(listsToStore);
      this.storeItems(itemsToStore);   
      for(var i = 0, lenI = listsToStore.length; i < lenI; i++){
         var items = [];
         for(var j = 0, lenJ = itemsToStore.length; j < lenJ; j++){
            if(itemsToStore[j].parentId == listsToStore[i].id){
               items.push(itemsToStore[j]);
            }
         }
         for(var k = 0, lenK = listsToStore.length; k < lenK; k++){       
            if(listsToStore[k].parentId == listsToStore[i].id){
               items.push(listsToStore[k]);
            }
         }
         this.addRecentItems(  listsToStore[i].id,items)
         this.addFrequentItems(listsToStore[i].id,items)  
      }
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

   this.existsInItemSubArray = function(itemArray,id){
      for(var i = 0, len = itemArray.length; i < len; i++){  
         if(itemArray[i].itemId == id){
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

   this.findInSubArray = function(itemArray,id){
      for(var i = 0, len = itemArray.length; i < len; i++){  
         if(itemArray[i].itemId == id){
            return itemArray[i];
         }
      }
      return null;
   }
   
   this.findRecentItems = function(list){
      var recentItems = this.getStoredObject(this.keys.recentKeys(list.id));
      if(!recentItems){
         recentItems = [];
      }
      return recentItems;
   }

   this.storeRecentItems = function(list,recentItems){
      var shallowRecentItems = $.map(recentItems,function(element,i){
         if(element.item){
            element.itemId = element.item.id;
            element.item = null;
         }
         return element;
      });
      this.storeObject(this.keys.recentKeys(list.id),shallowRecentItems);      
   }

   this.addRecentItems = function(listId,items){
      var localList = this.findList(listId);
      if(localList != null){
         var recentItems = this.findRecentItems(listId);
         for(var i = 0, len = items.length; i < len; i++){
            this.addRemoveRecentItemWithKeys(recentItems,items[i]);
         }
         this.storeRecentItems(localList,recentItems);
      }
   }
   
   // this.removeRecentItemFromArray = function(recentItems,recentItem){
   //    return recentItems.filter(function(element,i){
   //       return element.item.id !== recentItem.id;
   //    });
   // }

   this.addRemoveRecentItemWithKeys = function(recentItems,item){
      if( this.existsInItemSubArray(recentItems,item.id)){
         var oldRecentItem = this.findInSubArray(recentItems,item.id);
         if(oldRecentItem){
            var newRecentItem = this.factory.cloneRecent(oldRecentItem,item);
            newRecentItem.touch();
            recentItems = $.map(recentItems,function(element,id){
               if(element.itemId == oldRecentItem.itemId){
                  return newRecentItem;
               } else {
                  element;
               }
            });
         } else {
            console.log("Item not found to clone: " + item.id);
         }
      } else {
         var recentItem = (item.type == "ShoppingList") 
            ? new RecentItem(this.factory.cloneList(item))
            : new RecentItem(this.factory.cloneItem(item));
         recentItems.push(recentItem);
      }
   }

   this.addRemoveRecentItem = function(list,item){
      var recentItems = this.findRecentItems(list);
      this.addRemoveRecentItemWithKeys(recentItems,item);
      this.storeRecentItems(list,recentItems);
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

   this.findFrequentItems = function (list){
      var frequentItems = this.getStoredObject(this.keys.frequentKeys(list.id));
      if(!frequentItems){
         frequentItems = [];
      } 
      return frequentItems;
   }

   this.storeFrequentItems = function(list,frequentItems){
      var shallowFrequentItems = $.map(frequentItems,function(element,i){
         if(element.item){
            element.itemId = element.item.id;
            element.item = null;
         }
         return element;
      });
      this.storeObject(this.keys.frequentKeys(list.id),shallowFrequentItems);      
   }
   
   this.addFrequentItems = function(listId,items){
      var localList = this.findList(listId);
      if(localList != null){
         var frequentItems = this.findFrequentItems(localList);
         for(var i = 0, len = items.length; i < len; i++){
            this.addOrIncrementFrequentItemFromKeys(frequentItems,items[i])
         }
         this.storeFrequentItems(localList,frequentItems);
      }
   }
   
   this.removeFrequentItemFromArray = function(frequentItems,frequentItem){
      return frequentItems.filter(function(element,i){
         return element.itemId !== frequentItem.id;
      });
   }

   this.addOrIncrementFrequentItemFromKeys = function(frequentItems,item){
      if( this.existsInItemSubArray(frequentItems,item.id)){
         var oldFrequentItem = this.findInSubArray(frequentItems,item.id);
         if(oldFrequentItem){
            var newFrequentItem = this.factory.cloneFrequent(oldFrequentItem,item);
            newFrequentItem.increment();
            frequentItems = this.removeFrequentItemFromArray(frequentItems,oldFrequentItem);
            frequentItems.push(newFrequentItem);
         }
      } else {
         var frequentItem = (item.type == "ShoppingList") 
            ? new FrequentItem(this.factory.cloneList(item))
            : new FrequentItem(this.factory.cloneItem(item));
         frequentItems.push(frequentItem);
      }
   }
 
   this.addOrIncrementFrequentItem = function(list,item){
      var localList = this.findList(list.id);
      if(localList != null){
         var localItem = this.findItem(item.id);
         if(localItem != null){
            var frequentItems = this.findFrequentItems(list);
            this.addOrIncrementFrequentItemFromKeys(frequentItems,item)
            this.storeFrequentItems(list,frequentItems);
         }
      }
   }

   // this.findNotOnLists = function(){
   //    var notOnLists = {};
   //    var listKeys = this.getStoredObject(this.keys.listKeys);
   //    var itemKeys = this.getStoredObject(this.keys.itemKeys);
   //    for(var i = 0, len = listKeys.length; i < len; i++){
   //       var list = this.findList(listKeys[i]);
   //       if(list){
   //          var orphaned = [];
   //          for(var j = 0, len = listKeys.length; j < len; j++){
   //             var subList = this.findList(listKeys[i]);
   //             if(subList && subList.parentId == list.id && !list.hasItemId(subList.id)){
   //                orphaned.push(subList);
   //             }
   //          }
   //          for(var h = 0, len = itemKeys.length; h < len; h++){
   //             var item = this.findItem(itemKeys[h]);
   //             if(item && item.parentId == list.id && !list.hasItemId(item.id)){
   //                orphaned.push(item);
   //             }
   //          }
   //          notOnLists[list.id] = orphaned;
   //       }
   //    }
   //    return notOnLists;
   // }

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
      console.log("Remove sublist " + subList.logString());
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

