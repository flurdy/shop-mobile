
var ShoppingItem = function(id,title,description,quantity,lastSynced,parent){
   this.type        = "ShoppingItem"
   this.id          = id;
   this.title       = title;
   this.description = description;
   this.quantity    = quantity;
   this.lastSynced  = lastSynced;
   this.inBasket    = false;
   this.dirty       = false;
   this.parent      = parent;
   this.parentId = (parent) ? parent.id : null;
   this.isOnList    = function(){
      return this.parent && this.parent.hasItem(this.id);
   }
   this.setAsParent = function(list){
      this.parent   = list;
      this.parentId = list.id;
   }
}

var ShoppingList = function(id,title,description,quantity,lastSynced,items){
   this.type        = "ShoppingList"
   this.id          = id;
   this.title       = title;
   this.description = description;
   this.lastSynced  = lastSynced;
   this.items       = items;
   this.itemIds     = [];
   for(var i = 0, len = items.length; i < len; i++){      
      this.itemIds.push(items[i].id);
   }
   this.quantity    = quantity;
   this.parent      = null;
   this.parentId    = null;
   this.setAsItemsParent = function(){
      for(var i=0;i<this.items.length;i++) {
         this.items[i].setAsParent(this);
      }
   }
   this.setAsParent = function(list){
      this.parent   = list;
      this.parentId = list.id;
   }
   this.hasParent = function(){
      return this.parentId !== undefined && this.parentId !== null;
   }
   this.isOnList    = function(){
      return this.parent && this.parent.hasItem(this.id);
   }
   this.hasItem     = function(itemId){
      for(var i=0;i<this.items.length;i++) {
         if(this.items[i].id === itemId){
            return true;
         }
      }
    return false;
   }
   this.hasItemId    = function(itemId){
      for(var i=0;i<this.itemIds.length;i++) {
         if(this.itemIds[i] === itemId){
            return true;
         }
      }
    return false;
   }
   this.orderedItems = function() {
      return this.items.sort(function(a,b){
         return a.title > b.title;
      });
   }
   this.addItem = function(item){
      if(!this.hasItem(item.id)){
         this.items.push(item);
      }
      if(!this.hasItemId(item.id)){
         this.itemIds.push(item.id);
      }
      item.setAsParent(this);
   }
}

var ShopFactory = function(){
   this.guid = new Guid();
   this.initialize = function(){
      return this;
   }
   this.newId = function(){
      return this.guid.guid();
   }
   this.newItem = function(inputs){
      return new ShoppingItem(this.newId(),inputs.title,inputs.description,1);
   }
}

var BreadCrumbs = function(){
   this.crumbs = [];
   this.reset = function(){
      this.crumbs = [];
   }  
   this.push = function(view){
      this.crumbs.push(view);
   }
   this.unpush = function(view){
      this.crumbs.pop();
   }
   this.peek = function(view){
      this.crumbs.pop()();
   }
   this.pop = function(){
      this.crumbs.pop();
      this.crumbs.pop()();
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
