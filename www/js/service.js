
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
      this.cache[id] = null;
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
      if(this.listCache.isCached(listId)){
         return this.listCache.findObject(listId);
      } else {
         var list = this.adapter.findList(listId);
         this.listCache.cache(listId,list);
         return list;
      }
   }
   this.findItem = function(list,itemId){
      // console.log('Looking for item id '+ itemId);
      if(this.itemCache.isCached(itemId)){
         return this.itemCache.findObject(itemId);
      } else {
         var item = this.adapter.findItem(list,itemId);
         this.itemCache.cache(itemId,item);
         return item;
      }
   }
   this.findRecentItems = function(list){
      if(this.recentCache.isCached(list.id)){
         return this.recentCache.findObject(list.id);
      } else {
         var items = this.adapter.findRecentItems(list);
         var itemsOnly = $.map(items,function(mapItem,i){
            return mapItem.item;
         });
         var hydrated = $.map(items,function(mapItem,i){
            return app.service.findItem(list,mapItem.item.id);
         });
         var notOnListItems = hydrated.filter(function(element,i){
               return !element.isOnList() || element.quantity < 1;
            });
         var sortedItems = notOnListItems.sort(function(a,b){
            return a.title > b.title;
         });
         this.recentCache.cache(list.id,sortedItems);
         return sortedItems;
      }
   }
   this.findFrequentItems = function(list){
      console.log('Finding recent items');
      if(this.frequentCache.isCached(list.id)){
         console.log('Found cached recent items');
         return this.frequentCache.findObject(list.id);
      } else {
         var items = this.adapter.findFrequentItems(list);
         var hydrated = $.map(items,function(mapItem,i){
            return app.service.findItem(list,mapItem.item.id);
         });
         var notOnListItems = hydrated.filter(function(element,i){
               return !element.isOnList() || element.quantity < 1;
            });      
         var sortedItems = notOnListItems.sort(function(a,b){
            return a.title > b.title;
         });
         this.frequentCache.cache(list.id,sortedItems);
         return sortedItems;
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
         var items = this.adapter.searchForItems(list,lowerCaseSearchTerm);
         var hydrated = $.map(items,function(mapItem,i){
            return app.service.findItem(list,mapItem.id);
         });
         var notOnListItems = hydrated.filter(function(element,i){
               return !element.isOnList() || element.quantity < 1;
            });
         this.searchCache[list.id].cache(lowerCaseSearchTerm,notOnListItems);
         return notOnListItems;
      }
   }
   this.addItem = function(list,item){
      if(item.quantity<1){
         item.quantity = 1;
      }
      this.updateItem(list,item);
      this.listCache.invalidate(list.id);
      this.frequentCache.invalidate(list.id);
      this.recentCache.invalidate(list.id);
      list.items.push(item);
      this.adapter.addItem(list,item);
      this.adapter.addRecentItem(list,item);
      this.adapter.incrementFrequentItem(list,item);
      // this.listCache.cache(list.id,list);
   }
   this.createNewItem = function(inputs){
      return this.factory.inputToItem(inputs);
   }
   this.addNewItem = function(list,item){
      this.listCache.invalidate(list.id);
      this.adapter.addNewItem(list,item); 
      list.addItem(item);
      // this.itemCache.cache(item.id,item);     
      this.addItem(list,item);
   }
   this.removeItem = function(list,item){
      console.log("Removing item \"" + item.title + "\" [" 
                  + item.id + "] from list \"" + list.title
                  + "\" [" + list.id + "]");
      this.listCache.invalidate(list.id);
      this.itemCache.invalidate(item.id);
      this.adapter.removeItem(list,item);
      list.removeItem(item);
   }
   this.removeSubList = function(list,subList){
      console.log("Removing list \"" + subList.title + "\" [" 
                  + subList.id + "] from list \"" + list.title
                  + "\" [" + list.id + "]");
      this.listCache.invalidate(list.id);
      this.adapter.removeSubList(list,subList);
      list.removeItem(subList);
      this.listCache.cache(list.id,list);
   }
   this.updateItem = function(list,item){
      this.listCache.invalidate(list.id);
      this.itemCache.invalidate(item.id);
      this.adapter.updateItem(list,item);
   }
   this.updateSubList = function(list,subList){
      this.listCache.invalidate(list.id);
      this.listCache.invalidate(subList.id);
      this.adapter.updateSubList(list,subList);
      list.items = $.map(list.items,function(listItem,i){
         if(listItem.id == subList.id){
            return subList;
         } else {
            return listItem;
         }
       });
      this.listCache.cache(subList.id,subList);
      this.listCache.cache(list.id,list);
   }
   this.convertToSubList = function(list,item){
      this.itemCache.invalidate(item.id);
      this.listCache.invalidate(list.id);
      var subList = this.factory.cloneList(item);
      this.adapter.deleteItem(list,item);
      this.adapter.addNewSubList(list,subList);
      return subList;
   }
   this.sync = function(){
      // TODO  
   }

}
