
var ShoppingItem = function(id,title,description,quantity,lastSynced,inBasket,isPurchased,dirty){
   this.type        = "ShoppingItem"
   this.id          = id;
   this.title       = title;
   this.description = description;
   this.quantity    = quantity;
   this.lastSynced  = lastSynced;
   this.inBasket    = inBasket;
   this.isPurchased = isPurchased;
   this.dirty       = dirty;
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
   this.hasParent   = function(){
      return this.parent !== undefined && this.parent !== null;
   }
}
