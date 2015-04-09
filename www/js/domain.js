
var ShoppingItem = function(id){ // ,title,description,quantity,lastSynced,parent){
   this.type        = "ShoppingItem"
   this.id          = id;
   this.title       = null; // title;
   this.description = null; // description;
   this.quantity    = null; // quantity;
   this.lastSynced  = null; // lastSynced;
   this.inBasket    = false;
   this.dirty       = false;
   this.parent      = null; // parent;
   this.parentId    = null; // null; // (parent) ? parent.id : null;
   this.isOnList    = function(){
      return this.parent && this.parent.hasItem(this.id);
   }
   this.setAsParent = function(list){
      this.parent   = list;
      this.parentId = list.id;
   }
   this.logString   = function(){
      return "\"" + this.title + "\" [" + this.id + "]";
   }
}

var ShoppingList = function(id) { // ,title,description,quantity,lastSynced,items){
   this.type        = "ShoppingList"
   this.id          = id;
   this.title       = null; // title;
   this.description = null; // description;
   this.lastSynced  = null; // lastSynced;
   this.items       = []; // items;
   this.itemIds     = [];
   // for(var i = 0, len = items.length; i < len; i++){      
   //    this.itemIds.push(items[i].id);
   // }
   this.quantity    = null; // quantity;
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
      if(!this.itemIds){
         this.itemIds = [];
      }
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
      if(item.quantity<1){
         this.removeItem(item);
      } else {
         if(!this.hasItem(item.id)){
            this.items.push(item);
         }
         if(!this.hasItemId(item.id)){
            this.itemIds.push(item.id);
         }
      }
      item.setAsParent(this);
   }
   this.removeItem = function(item){
      if(this.hasItem(item.id)){
         this.items = this.items.filter(function(element,i){
           return element.id !== item.id;
        });
      }
      if(this.hasItemId(item.id)){
         this.itemIds.splice($.inArray(item.id,this.itemIds), 1);
      }
   }
   this.logString   = function(){
      return "\"" + this.title + "\" [" + this.id + "]";
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
   this.newItem = function(title,description,quantity){
      var item = new ShoppingItem(this.newId());
      item.title       = title;
      item.description = description;
      item.quantity    = quantity;
      return item;
   }
   this.cloneItem = function(sourceItem){ //id,title,description,quantity,parent){
      var item         = new ShoppingItem(sourceItem.id);
      item.title       = sourceItem.title;
      item.description = sourceItem.description;
      item.quantity    = sourceItem.quantity;
      if(sourceItem.parent){
         item.setAsParent(sourceItem.parent);
      } else {
         item.parentId = sourceItem.parentId;
      }
      return item;
   }
   this.inputToItem = function(inputs){
      return this.newItem(inputs.title,inputs.description,1);
   }
   this.newList = function(title,description,quantity){
      var list = new ShoppingList(this.newId());
      if(title){
         list.title = title;
      }
      if(description){
         list.description = description;
      }
      if(quantity){
         list.quantity = quantity;
      }
      return list;

   }
   this.cloneList = function(sourceList){ 
      var list         = new ShoppingList(sourceList.id);
      list.title       = sourceList.title;
      list.description = sourceList.description;
      list.quantity    = sourceList.quantity;
      if(sourceList.parent){
         list.setAsParent(sourceList.parent);
      } else if(sourceList.parentId){
         list.parentId = sourceList.parentId;
      } 
      list.itemIds     = sourceList.itemIds;
      return list;
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
