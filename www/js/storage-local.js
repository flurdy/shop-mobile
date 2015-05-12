
var ShopRepository = function(){

   this.factory = new ShopFactory();

   this.keys = {
      listKeys     : "listKeys",
      listItemKeys : function(listId){
         return "list.items." + listId;
      },
      itemKeys     : "itemKeys",
      lists        : function(listId){
         return "list." + listId;
      },
      items        : function(itemId){
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
         this.storeListsAndItems(stubLists,stubItems);
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
      if(list.parentId){
         this.addItemToListItemKeys(list.parentId,list.id);
      }
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
      if(item.parentId){
         this.addItemToListItemKeys(item.parentId,item.id);
      }
   }

   this.updateStoredItem = function(item) {
      this.storeItem(item);
   }

   this.findStoredListItemKeys = function(listId){
      var listItemKeys = this.getStoredObject(this.keys.listItemKeys(listId));
      if(!listItemKeys){
         listItemKeys = [];
      }
      return listItemKeys;
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

   this.storeListItemKeys = function(listId,itemKeys){
      this.storeObject(this.keys.listItemKeys(listId),itemKeys);
   }

   this.addItemToListItemKeys = function(listId,itemId){
      var listItemKeys = this.findStoredListItemKeys(listId);
      if($.inArray(itemId, listItemKeys)){
         listItemKeys.push(itemId);
      }
      this.storeListItemKeys(listId,listItemKeys);
   }

   this.deleteStoredItem = function(item){
      if(item.isOnList()){
         item.parent.removeItem(this);
         item.parent   = null
         // item.parentId = null;
      }
      this.removeStoredObject(this.keys.items(item.id));
      var itemKeys = this.findStoredItemKeys();      
      itemKeys.splice($.inArray(item.id,itemKeys), 1);
      this.storeItemKeys(itemKeys);
      var listItemKeys = this.findStoredListItemKeys(item.parentId);      
      listItemKeys.splice($.inArray(item.id,listItemKeys), 1);
      this.storeListItemKeys(listItemKeys);
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
         if(!item.parent){
            if(!list || list.id != item.parentId){
              list = this.findList(item.parentId);               
            }
            if(list){
               item.setAsParent(list);
            }
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
      this.storeItem(item);
      var itemKeys = this.findStoredItemKeys();
      itemKeys.push( item.id );
      this.storeItemKeys(itemKeys);
      var listItemKeys = this.findStoredListItemKeys(list.id);
      listItemKeys.push( item.id );
      this.storeListItemKeys(list.id,itemKeys);
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
            this.addRecentItem(localList,localItem);
            this.addOrIncrementFrequentItem(localList,localItem);
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
         // var listItemKeys = this.findStoredListItemKeys(list.id);
         // listItemKeys.push( subList.id );
         // this.storeListItemKeys(list.id,itemKeys);
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
            this.addRecentItem(localList,localSubList);
            this.addOrIncrementFrequentItem(localList,localSubList);
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
            this.addRecentItem(localList,localItem);
            this.addOrIncrementFrequentItem(localList,localItem);
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
            this.addRecentItem(localList,localSubList);
            this.addOrIncrementFrequentItem(localList,localSubList);
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

   // this.findAllLists = function(){
   //    var listKeys = this.findStoredListKeys();
   //    var self = this;
   //    // var listIds = this.getStoredObject(this.keys.listKeys);
   //    return $.map(listKeys,function(id,i){
   //       return self.findList(id);
   //    });
   // }

   this.itemOrListHasSearchTerm = function(item,searchTerm){
      if(item.title.toLowerCase().indexOf(searchTerm) > -1){
         return true;
      } else if(item.description && item.description.toLowerCase().indexOf(searchTerm) > -1){
         return true;
      }
      return false;
   }
   
   // this.searchListsNotOnList = function(lists,searchTerm){
   //    var self = this;
   //    return lists.filter(function(element,i){
   //       if(self.itemOrListHasSearchTerm(element,searchTerm)){
   //          if(!element.parent && element.parentId){
   //             element.parent = this.findList(element.parentId);
   //          }
   //          if(element.parent){
   //             return !element.parent.hasItemId(element.id);
   //          }
   //       } 
   //       return false;
   //    });
   // }

   this.findItemsNotOnList = function(list){
      var listItemKeys = this.findStoredListItemKeys(list.id);
      var items = [];
      for(itemKey in listItemKeys){
         if(!list.hasItemId( listItemKeys[itemKey])){
            var item = this.findItem(listItemKeys[itemKey],list);
            if(item){
               items.push(item);
            } else {
               var subList = this.findList(listItemKeys[itemKey]);
               if(subList){
                  items.push(subList);
               }
            }
         }
      }
      return items;
   }
   
   this.searchListItemsNotOnList = function(list,searchTerm){
      var items = this.findItemsNotOnList(list);
      var self = this;
      return items.filter(function(element,i){
         if(element.parentId && element.parentId == list.id){
            return self.itemOrListHasSearchTerm(element,searchTerm);
         }
         return false;
      });
   }

   this.isListKey = function(listId){
      var listKeys = this.findStoredListKeys();
      return $.inArray(listId,listKeys);
   }

   this.findSubLists = function(list){
      var listItemKeys = this.findStoredListItemKeys(list.id);
      var subLists = [];
      for(itemKey in listItemKeys){
         if(this.isListKey(listItemKeys[itemKey])){
            var subList = this.findList(listItemKeys[itemKey]);
            if(subList){
               subLists.push(subList);
            }
         }
      }
      return subLists;
   }

   this.searchForItems = function(list,searchTerm){
      var itemsWithSearchTerm = this.searchListItemsNotOnList(list,searchTerm);  
      var subLists = this.findSubLists(list);
      for(subList in subLists){
         var subItems = this.searchForItems(subLists[subList],searchTerm); 
         itemsWithSearchTerm = itemsWithSearchTerm.concat(subItems);
      }
      return itemsWithSearchTerm;
   }


}

