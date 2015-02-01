
var ShopAdapter = function(){
   this.repository;
   this.api;
   this.initialize = function(repository,api){
      this.repository = repository;
      this.api        = api;
      return this;
   }
   this.useRepository = function(){
      return this.api === undefined && this.repository !== undefined;
   }
   this.findDefaultList = function(){
      if(this.useRepository()){
         var id = this.repository.findDefaultListId();
         console.log('Default id is ' + id);
         return this.findList(id);
      } else {
         console.log('No repository nor api defined');
         return null;
      }
   }
   this.findList = function(listId){
      if(listId === undefined){
         console.log('List id is undefined');
         return null;
      } else {
         if(this.useRepository()){
            return this.repository.findList(listId);
         } else {
            console.log('No repository nor api defined');
            // return this.api.findList(listId);
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

   this.addNewItem = function(list,item){
      if(this.useRepository()){
         this.repository.addNewItem(list,item);
      } else {
         console.log('No repository nor api defined');
      }
   }
   
   this.addItem = function(list,item){
      if(this.useRepository()){
         this.repository.addItem(list,item);
      } else {
         console.log('No repository nor api defined');
      // todo
      }
   }
   
   this.updateItem = function(list,item){
      if(this.useRepository()){
         this.repository.updateItem(list,item);
      } else {
         console.log('No repository nor api defined');
      // todo
      }
   }

   this.updateSubList = function(list,subList){
      if(this.useRepository()){
         this.repository.updateSubList(list,subList);
      } else {
         console.log('No repository nor api defined');
      // todo
      }
   }
   
   this.convertToSubList = function(list,item,subList){ 
      if(this.useRepository()){
         this.repository.deleteItem(item);
         this.repository.addList(subList);
      } else {
         console.log('No repository nor api defined');
      // todo
      }
   }
   
   this.removeItem = function(list,item){
      if(this.useRepository()){
         this.repository.removeItem(list,item);
      } else {
         console.log('No repository nor api defined');
      // todo
      }
   }
   
   this.removeSubList = function(list,subList){
      if(this.useRepository()){
         this.repository.removeSubList(list,subList);
      } else {
         console.log('No repository nor api defined');
      // todo
      }
   }   

}
