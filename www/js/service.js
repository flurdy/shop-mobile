
var ShopCache = function(){
   this.cache = {};
   this.isCached = function(id){ 
      return this.cache[id] !== null && 
             this.cache[id] !== undefined; 
   }
   this.cache = function(id,object){ 
      this.cache[id] = object; 
   }
   this.invalidate = function(id){
      if(this.isCached(id)){ 
         this.cache[id] = null;
      }
   }
   this.invalidateAll = function(){ 
      this.cache = {};
   }
   this.findObject = function(id){ 
      return this.cache[id];
   }
   this.isEmpty = function(){
      return this.cache.length==0;
   }
}

var ShopService = function(){
   this.adapter;
   this.defaultListId;
   this.listCache      = new ShopCache();
   this.itemCache      = new ShopCache();
   this.frequentCache  = new ShopCache();
   this.recentCache    = new ShopCache();
   this.searchCache    = {}; // Map of caches per list
   this.factory        = new ShopFactory();
   this.initialize = function(adapter){
      this.adapter = adapter;
   }
   this.findDefaultList = function(){
      if(this.defaultListId){
        return this.findList(this.defaultListId);
      } else {
         var list = this.adapter.findDefaultList();
         if(list){
            this.defaultListId = list.id;
            return list;
         }
      }
   }
   this.findList = function(listId){
      // console.log('Looking for list id '+ listId);
      if(listId && listId != ""){
         if(this.listCache.isCached(listId)){
            return this.listCache.findObject(listId);
         } else {
            var list = this.adapter.findList(listId);
            if(list){
               this.listCache.cache(listId,list);
               return list;
            } else {
               console.log("List not found: " + listId);
            }
         }
      } else {
         console.log("No list id");
      }
   }
   this.findItem = function(list,itemId){
      // console.log('Looking for item id '+ itemId);
      if(this.itemCache.isCached(itemId)){
         return this.itemCache.findObject(itemId);
      } else {
         var item = this.adapter.findItem(list,itemId);
         if(item){
            this.itemCache.cache(itemId,item);
            return item;
         } else {
            console.log("Item not found: " + itemId);
         }
      }
   }
   this.findRecentItems = function(list){
      if(this.recentCache.isCached(list.id)){
         return this.recentCache.findObject(list.id);
      } else {
         var items = this.adapter.findRecentItems(list);
         var hydrated = $.map(items,function(mapItem,i){
            if(mapItem.type == "ShoppingList"){
               mapItem.item = app.service.findList(mapItem.itemId);
            } else {
               mapItem.item = app.service.findItem(list,mapItem.itemId);
            }
            return mapItem;
         });
         var sortedItems = hydrated.sort(function(a,b){
            return !b || !b.item || a.item.title > b.item.title;
         });
         this.recentCache.cache(list.id,sortedItems);
         return sortedItems;
      }
   }
   this.filterRecentItems = function(list){
      var items = this.findRecentItems(list);
      var notOnListItems = items.filter(function(element,i){
            return !element.item.isOnList() || element.item.quantity < 1;
         });
      var extractItems = $.map(notOnListItems,function(mapItem,i){
         return mapItem.item;
      });     
      return extractItems;   
   }
   this.findFrequentItems = function(list){
      // console.log('Finding recent items');
      if(this.frequentCache.isCached(list.id)){
         // console.log('Found cached recent items');
         return this.frequentCache.findObject(list.id);
      } else {
         var items = this.adapter.findFrequentItems(list);
         var hydrated = $.map(items,function(mapItem,i){
            if(mapItem.type == "ShoppingList"){
               mapItem.item = app.service.findList(mapItem.itemId);
            } else {
               mapItem.item = app.service.findItem(list,mapItem.itemId);
            }
            return mapItem;
         });    
         var sortedItems = hydrated.sort(function(a,b){
            return !b || !b.item || a.item.title > b.item.title;
         });
         this.frequentCache.cache(list.id,sortedItems);
         return sortedItems;
      }
   }
   this.filterFrequentItems = function(list){
      var frequentItems = this.findFrequentItems(list);
      var notOnListItems = frequentItems.filter(function(element,i){
            return !element.item.isOnList() || element.item.quantity < 1;
         }); 
      var extractItems = $.map(notOnListItems,function(mapItem,i){
         return mapItem.item;
      });     
      return extractItems;
   }
   this.resetSearchCache = function(listId){
      if( this.searchCache[listId] ){
         this.searchCache[listId].invalidateAll();
      } else{
         this.searchCache[listId] = new ShopCache();
      }
   }
   this.searchForItems = function(list,searchTerm){
      console.log("Searching list: " + list.id);
      console.log("Searching for: " + searchTerm);
      var lowerCaseSearchTerm = searchTerm.toLowerCase();
      if( !this.searchCache[list.id] ){
         this.searchCache[list.id] = new ShopCache();
      } 
      if( this.searchCache[list.id].isCached(lowerCaseSearchTerm) ){
         return this.searchCache[list.id].findObject(lowerCaseSearchTerm);
      } else {
         return this.adapter.searchForItems(list,lowerCaseSearchTerm);
      }
   }
   this.addItem = function(list,item){
      console.log("Adding item " + item.logString() + " to list " + list.logString());      
      if(item.isList){
         this.listCache.invalidate(item.id);
      } else {
         this.itemCache.invalidate(item.id);
      }
      this.listCache.invalidate(list.id);
      this.resetSearchCache(list.id);
      if(item.quantity<1){
         item.quantity = 1;
         this.updateItem(list,item);
      }
      if(item.isList){
         item.removeAllItems();
         this.updateSubList(item,list);
      }
      list.addItem(item);      
      if(item.isItem){
         this.adapter.addItem(list,item);
      } else {
         this.adapter.addSubList(list,item);
      }
      this.addParentItemIfNotOnList(list);
      this.addRecentItem(list,item);
      this.incrementFrequentItem(list,item);
   }
   this.addParentItemIfNotOnList = function(parentList){
      if(parentList.hasParent() && !parentList.isOnList()){
         // parentList.removeAllItems();
         // this.updateSubList(parentList.parent,parentList);
         this.addItem(parentList.parent,parentList);
      }
   }
   this.addRecentItem = function(list,item){
      this.recentCache.invalidate(list.id);
      this.adapter.addRecentItem(list,item);
   }
   this.incrementFrequentItem = function(list,item){
      this.frequentCache.invalidate(list.id);
      this.adapter.addOrIncrementFrequentItem(list,item);
   }
   this.createNewItem = function(inputs){
      return this.factory.inputToItem(inputs);
   }
   this.addNewItem = function(list,item){
      this.listCache.invalidate(list.id);
      this.resetSearchCache(list.id);
      this.adapter.addNewItem(list,item); 
      list.addItem(item);    
      this.addItem(list,item);
   }
   this.removeItem = function(list,item){
      console.log("Removing item \"" + item.title + "\" [" 
                  + item.id + "] from list \"" + list.title
                  + "\" [" + list.id + "]");
      this.invalidateAncestors(list);
      this.itemCache.invalidate(item.id);
      list.removeItem(item);
      this.adapter.removeItem(list,item);
      if(item.parent.hasParent()){
         this.updateSubList(item.parent)
      }
   }

   this.removeSubList = function(list,subList){
      console.log("Removing list \"" + subList.title + "\" [" 
                  + subList.id + "] from list \"" + list.title
                  + "\" [" + list.id + "]");
      this.invalidateAncestors(subList);
      this.adapter.removeSubList(list,subList);
      list.removeItem(subList);
      this.removeListItems(subList);      
   }

   this.invalidateAncestors = function(list){      
      this.listCache.invalidate(list.id);
      this.resetSearchCache(list.id);
      this.recentCache.invalidate(list.id);
      this.frequentCache.invalidate(list.id);
      if(list.hasParent()){      
         var parent = list.parent || this.findList(list.parentId);   
         if(parent){
            this.invalidateAncestors(parent);
         }
      }
   }

   this.removeListItems = function(list){
      var items = list.items.filter(function(item,i){
         return item.isOnList();
      });
      for(var i = 0; i < items.length; i++){
         if(items[i].isItem){
            var item = this.findItem(list,items[i].id);
            if(item){
               this.removeItem(list,item);
            }
         } else if(items[i].isList){
            var subList = this.findList(items[i].id);
            if(subList){
               this.removeSubList(list,subList);
            }
         }
      }
   }

   this.updateItem = function(list,item){
      this.listCache.invalidate(list.id);
      this.itemCache.invalidate(item.id);
      this.recentCache.invalidate(list.id);
      this.frequentCache.invalidate(list.id);
      this.adapter.updateItem(list,item);
   }
   this.updateSubList = function(subList,parentList){      
      if(subList.hasParent()){
         if(parentList === undefined){         
            parentList = this.findList(subList.parentId);
         }
         this.listCache.invalidate(subList.parentId);
         this.recentCache.invalidate(subList.parentId);
         this.frequentCache.invalidate(subList.parentId);
      }
      this.listCache.invalidate(subList.id);
      this.recentCache.invalidate(subList.id);
      this.frequentCache.invalidate(subList.id);
      this.adapter.updateSubList(parentList,subList);
   }
   this.convertToSubList = function(list,item){
      this.itemCache.invalidate(item.id);
      this.listCache.invalidate(list.id);
      this.recentCache.invalidate(list.id);
      this.frequentCache.invalidate(list.id);
      var subList = this.factory.cloneAsList(item);
      this.adapter.deleteItem(list,item);
      this.adapter.addNewSubList(list,subList);
      return subList;
   }
   this.sync = function(){
      // TODO  
   }

}
