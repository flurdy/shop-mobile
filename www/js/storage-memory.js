
var ShopRepository = function(){
   this.lists = {}
   this.items = {}
   this.recentItems   = {};
   this.frequentItems = {};

   this.initialize = function(stubLists,stubItems){
      this.addToLists(stubLists);
      this.addToItems(stubItems);
      var notOnLists = this.findNotOnLists();
      console.log("not on lists "+notOnLists);
      for(var key in notOnLists){
         console.log("not on lists key "+key);
         this.addRecentItems(key,notOnLists[key])
         this.addFrequentItems(key,notOnLists[key])
      }
   }

   this.existsInArray = function(array,id){
      for(element in array){
         if(array[element].item.id == id){
            return true;
         }
      }
      return false;
   }    

   this.findInArray = function(array,id){
      for(element in array){
         if(array[element].item.id == id){
            return array[element];
         }
      }
      return null;
   }

   this.addRecentItems = function(listId,items){
      if(!this.recentItems[listId]){
         this.recentItems[listId] = [];
      } 
      for(var itemIndex in items){
         if( this.existsInArray(this.recentItems[listId],items[itemIndex].id)){
            var recentItem = this.findInArray(this.recentItems[listId],items[itemIndex].id);
            recentItem.addAgain();
         } else {
            this.recentItems[listId].push(new RecentItem(items[itemIndex]));
         }
      }
   }

   this.addFrequentItems = function(listId,items){
      if(!this.frequentItems[listId]){
         this.frequentItems[listId] = [];
      } 
      for(var itemIndex in items){
         this.addFrequentItem(listId,items[itemIndex])
      }
   }

   this.addFrequentItem = function(listId,item){
      if( this.existsInArray(this.frequentItems[listId],item.id)){
         var frequentItem = this.findInArray(this.frequentItems[listId],item.id);
         frequentItem.increment();
      } else {
         this.frequentItems[listId].push(new FrequentItem(item));
      }
   }

   this.findNotOnLists = function(){
      var notOnLists = {};
      for(var key in this.lists){
         var orphaned = [];
         for( var subKey in this.lists ){
            var subList = this.lists[subKey];
            if(subList.parent && subList.parent.id == key){
              if(!subList.isOnList()){
                  orphaned.push(subList);
              }
            }
         }
         for(var itemKey in this.items){
            var item = this.items[itemKey];
            if(item.parent && item.parent.id == key){
              if(!item.isOnList()){
               orphaned.push(item);
              }
           }
         }
         notOnLists[key] = orphaned;
      }
      return notOnLists;
   }

   this.findIsParent = function(items,parent){
      return items.filter(function(el,i){
         return el.parent === parent;
      });
   }

   this.addToLists = function(newLists){
      this.addToObject(this.lists,newLists);
   }

   this.addToItems = function(newItems){
      this.addToObject(this.items,newItems);
   }

   this.addToObject = function(object,newObjects){      
      for(var i=0, len=newObjects.length; i < len; i++){
         object[newObjects[i].id] = newObjects[i];
      }
   }

   this.findList = function(listId){
      return this.lists[listId];
   }

   this.findItem = function(itemId){
      return this.items[itemId];
   }

   this.findDefaultListId = function(){
      return 42;
   }

   this.addNewItem = function(list,item){
      this.items[item.id] = item;
      this.addItem(list,item);
   }

   this.addItem = function(list,item){
      var localList = this.findList(list.id);
      if(localList != null){
         var localItem = this.findItem(item.id);
         if(localItem != null){
            var items = localList.items.filter(function(element,i){
               return element.id !== localItem.id;
            });
            items.push(item);
            localItem.parent = localList;
            localList.items = items;
            this.addRemoveRecentItem(localList,localItem);
            this.addFrequentItem(localList.id,localItem);
         }
      }
   }

   this.addRemoveRecentItem = function(localList,localItem){
      var items = this.recentItems[localList.id].filter(function(element,i){
         return element.item.id !== localItem.id;
      });
      items.push(new RecentItem(localItem));
      this.recentItems[localList.id] = items;
   }

   this.addSubList = function(list,subList){
      var localList = this.findList(list.id);
      if(localList != null){
         var localSubList = this.findList(subList.id);
         if(localSubList != null){
            var items = localList.items.filter(function(element,i){
               return element.id !== subList.id;
            });
            items.push(subList);
            subList.parent = localList;
            localList.items = items;
            this.recentItems[localList.id].push(localSubList);
            this.frequentItems[localList.id].push(localSubList);
         }
      }
   }
   
   this.updateItem = function(list,item){
      var localList = this.findList(list.id);
      if(localList != null){
         var localItem = this.findItem(item.id);
         if(localItem != null){
            this.items[localItem.id] = item;
            this.addItem(localList,item);
         } 
      }
   }

   this.updateSubList = function(list,subList){
      var localList = this.findList(list.id);
      if(localList != null){
         var localSubList = this.findList(subList.id);
         if(localSubList != null){
            this.lists[localSubList.id] = subList;
            this.addSubList(list,subList);
         }
      }
   }
   
   this.convertToSubList = function(list,item,subList){       
      this.removeItem(list,item);t
      this.items[item.id] = undefined;
      this.lists[subList.id] = subList;
      this.addSubList(list,subList);
   }
   
   this.removeItem = function(list,item){
      var localList = this.findList(list.id);
      if(localList != null){
         var localItem = this.findItem(item.id);
         if(localItem != null){
            var items = localList.items.filter(function(element,i){
               return element.id !== localItem.id;
            });
            localList.items = items;
            return localList;
         }
      }
   }
   
   this.removeSubList = function(list,subList){
      var localList = this.findList(list.id);
      if(localList != null){
         var localSubList = this.findList(subList.id);
         if(localSubList != null){
            var items = localList.items.filter(function(element,i){
               return element.id !== localSubList.id;
            });
            localList.items = items;
            return localList;
         }
      }
   }
   
   this.findRecentItems = function(list){
      return this.recentItems[list.id];  
   }
   
   this.findFrequentItems = function(list){
      return this.frequentItems[list.id];  
   }

   this.objectToArray = function(object){
      var array = [];
      for(key in object){
         array.push(object[key]);
      }
      return array;
   }
   
   this.searchForItems = function(list,searchTerm){
      var searchLists = this.objectToArray(this.lists).filter(function(element,i){
         if(element.parent && element.parent.id == list.id){
            if(element.title.toLowerCase().indexOf(searchTerm) > -1){
               return true;
            } else if(element.description && element.description.toLowerCase().indexOf(searchTerm) > -1){
               return true;
            }
         }
         return false;
      });
      var searchItems = this.objectToArray(this.items).filter(function(element,i){
         if(element.parent && element.parent.id == list.id){
            if(element.title.toLowerCase().indexOf(searchTerm) > -1){
               return true;
            } else if(element.description && element.description.toLowerCase().indexOf(searchTerm) > -1){
               return true;
            }
         }
         return false;
      });
      return searchLists.concat(searchItems);
   }

}

