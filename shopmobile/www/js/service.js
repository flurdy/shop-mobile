
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
   this.defaultListId = 42;
   this.listCache      = new ShopCache();
   this.itemCache      = new ShopCache();
   this.frequentCache  = new ShopCache();
   this.recentCache    = new ShopCache();
   this.searchCache    = {}
   this.initialize = function(adapter){
      this.adapter = adapter;
   }
   this.findDefaultList = function(){
      return this.findList(this.defaultListId);
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
      console.log('Looking for item id '+ itemId);
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
         var items = this.adapter.findRecentItems(list.id);
         this.recentCache.cache(list.id,items);
         return items;
      }
   }
   this.findFrequentItems = function(list){
      console.log('Finding recent items');
      if(this.frequentCache.isCached(list.id)){
         console.log('Found cached recent items');
         return this.frequentCache.findObject(list.id);
      } else {
         var items = this.adapter.findFrequentItems(list.id);
         this.frequentCache.cache(list.id,items);
         return items;
      }
   }
   this.searchForItems = function(list,searchTerm){
      if( !this.searchCache[list.id] ){
         this.searchCache[list.id] = new ShopCache();
      } 
      if( this.searchCache[list.id].isCached(searchTerm) ){
         return this.searchCache[list.id].findObject(searchTerm);
      } else {
         var items = this.adapter.searchForItems(list,searchTerm);
         this.searchCache[list.id].cache(searchTerm,items);
         return items;
      }
   }
   this.addItem = function(list,item){
      
   }
   this.removeItem = function(list,item){

   }
   this.updateItem = function(list,item){

   }
}
