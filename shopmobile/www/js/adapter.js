
var ShopAdapter = function(){

   this.initialize = function(){
      return this;
   }

   this.findList = function(listId){
      if(listId === undefined){
         console.log('List id is undefined');
         return null;
      } else {
         for(var i=0, len=lists.length; i < len; i++){
            if(lists[i].id == listId)
               return lists[i];
         }
         console.log('No list found for id '+ listId);
         return null;
      }
   }

   this.findItem = function(list,itemId){
      console.log('Looking for item id '+ itemId);
      if(itemId === undefined){
         console.log('Item id is undefined');
         return null;
      } else {
         for(var i=0, len=items.length; i < len; i++){
            if(items[i].id == itemId)
               return items[i];
         }
         console.log('No item found for id '+ itemId);
         return null;
      }
   }

   this.findRecentItems = function(list){
      console.log('Finding recent items');
      return [item4,item7];
   }

   this.findFrequentItems = function(list){
      return [item3,item10];
   }

   this.searchForItems = function(list,searchTerm){
      return [item2,item8];
   }

}
