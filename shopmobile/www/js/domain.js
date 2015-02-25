
var ShoppingItem = function(id,title,description,quantity,lastSynced,parent){
   this.type        = "ShoppingItem"
   this.id          = id;
   this.title       = title;
   this.description = description;
   this.quantity    = quantity;
   this.lastSynced  = lastSynced;
   this.inBasket    = false;
   this.isPurchased = false;
   this.dirty       = false;
   this.parent      = parent;
   this.isOnList    = function(){
      return this.parent && this.parent.hasItem(this.id);
   }
}

var ShoppingList = function(id,title,description,quantity,lastSynced,items){
   this.type        = "ShoppingList"
   this.id          = id;
   this.title       = title;
   this.description = description;
   this.lastSynced  = lastSynced;
   this.items       = items;
   this.quantity    = quantity;
   this.parent      = null;
   this.setAsItemsParent = function(){
      for(var i=0;i<this.items.length;i++) {
         this.items[i].parent = this;
      }
   }
   this.hasParent   = function(){
      return this.parent !== undefined && this.parent !== null;
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
   this.orderedItems = function() {
      return this.items.sort(function(a,b){
         return a.title > b.title;
      });
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

