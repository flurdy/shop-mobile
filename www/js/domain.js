
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
      return this.parent && (this.parent.hasItem(this.id) || this.parent.hasItemId(this.id) )
   }
   this.setAsParent = function(list){
      this.parent   = list;
      this.parentId = list.id;
   }
   this.logString   = function(){
      return "\"" + this.title + "\" [" + this.id + "]";
   }
   this.detach      = function(){
      if(this.parent){
         this.parentId = this.parent.id;
      }
      this.parent   = null;
      return this;
   }
   this.isParent    = function(list){
      return this.parentId == list.id;
   }
   this.isList      = false;
   this.isItem      = true;
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
   this.isParent    = function(list){
      return this.parentId == list.id;
   }
   this.hasParent = function(){
      return this.parentId;
   }
   this.isOnList    = function(){
      return this.parent && (this.parent.hasItem(this.id) || this.parent.hasItemId(this.id) )
   }
   this.hasItem     = function(itemId){
      if(!this.items){
         this.items = [];
      }
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
         return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
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
   this.removeAllItems = function(){
      for(var i=0;i<this.itemIds.length;i++) {
         this.removeItem(this.itemIds[i]);
      }
   }
   this.detach      = function(){
      if(this.parent){
         this.parentId = this.parent.id;
      }
      this.parent   = null;
      this.items    = [];
      return this;
   }
   this.hasItemsInBasket = function(){      
      for(var i=0;i<this.items.length;i++) {
         if(this.items[i].isList && this.items[i].hasItemsInBasket() ){
            return true;
         } else if(this.items[i].inBasket){
            return true;
         }
      }
      return false;
   }
   this.isList      = true;
   this.isItem      = false;
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
   this.cloneObject = function(source,target){ 
      target.title       = source.title;
      target.description = source.description;
      target.quantity    = source.quantity;
      if(source.parent){
         target.setAsParent(source.parent);
      } else if(source.parentId){
         target.parentId = source.parentId;
      } 
      return target;
   }
   this.cloneItem = function(source){ 
      var item         = new ShoppingItem(source.id);
      this.cloneObject(source,item);
      item.inBasket    = source.inBasket;
      return item;
   }
   this.cloneAsList = function(source){ 
      var list         = new ShoppingList(source.id);
      this.cloneObject(source,list);
      return list;
   }
   this.cloneList = function(source){ 
      var list         = this.cloneAsList(source)
      list.itemIds     = source.itemIds;
      return list;
   }
   this.cloneFrequent = function(source,item){
      if(!item){
         item = this.cloneItem(source.item);
      }
      var frequentItem       = new FrequentItem(item);
      frequentItem.frequency = source.frequency;
      return frequentItem;
   }
   this.cloneRecent = function(source,item){
      if(!item){
         item = this.cloneItem(source.item);
      }
      var recentItem       = new RecentItem(item);
      recentItem.lastAdded = source.lastAdded;
      return recentItem;
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
   this.replace = function(view){
      this.crumbs.pop();
      this.crumbs.pop();
      this.push(view);
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
   this.doublePop = function(){
      this.crumbs.pop();
      this.crumbs.pop();
      this.crumbs.pop()();
   }  
}

var RecentItem = function(itemOrList){
   this.lastAdded = new Date();
   this.item      = itemOrList.detach();
   this.itemId    = itemOrList.id;
   this.type      = itemOrList.type;
   this.touch     = function(){
      this.lastAdded = new Date();
   }
}

var FrequentItem = function(itemOrList){
   this.frequency = 1;
   this.item      = itemOrList.detach();
   this.itemId    = itemOrList.id;
   this.type      = itemOrList.type;
   this.increment = function(){
      this.frequency = this.frequency + 1;
   }
}
