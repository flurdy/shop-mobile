var RenderHelper = function(){
    this.header;
    this.content;
    this.selector;
    this.initialize = function(header,content,selector,partials){
        this.header = this.compile(header);
        if(content !== undefined){
            this.content = this.compile(content);
        }
        if(selector !== undefined){
            this.selector = this.compile(selector);
        }
        if(partials !== undefined){
            for( partial in partials){        
                Handlebars.registerPartial( 
                    partials[partial], $(this.partials[partials[partial]]).html());
            }
        }
    };
    this.compile = function(templateName){
        return Handlebars.compile($(templateName).html());
    };
    this.templates = {
        plainHeader:       "#plain-header-template",
        editableHeader:    "#editable-header-template",
        subHeader:         "#sub-header-template",
        editableSubHeader: "#editable-sub-header-template",
        listContent:       "#list-content-template",
        listEditContent:   "#list-edit-content-template",
        itemContent:       "#item-content-template",
        itemEditContent:   "#item-edit-content-template",
        itemAddContent:    "#item-add-content-template",
        archiveContent:    "#archive-content-template",
        optionsContent:    "#options-content-template",
        itemFindContent:   "#item-find-template",
        searchContent:     "#search-content-template"
    };
    this.partials = {
        parentPath:       "#parentPath-partial",
    };
    this.renderHeader = function(context){
        $('#header').html(this.header(context));
    }
    this.renderContent = function(context){
        $('.content').html(this.content(context));
    }
    this.renderSelector = function(selectorElement,context){
        $(selectorElement).html(this.selector(context));
    }
}

var HomeView = function(){ 
    this.service;
    this.listView    = new ListView();
    this.optionsView = new OptionsView();
    this.archiveView = new ArchiveView();
    this.currentList;
    this.initialize = function(service){
        this.service = service;
        this.listView.initialize(this.service);
        this.optionsView.initialize(service);
        this.archiveView.initialize(service);
        this.currentList = this.service.findDefaultList();   
    }
    this.renderFooter = function(list){
        $('.index-link').click(function(){
            app.homeView.listView.render(list.id);
        });   
        $('.archive-link').click(function(){
            app.homeView.archiveView.render(list.id);
        });   
        $('.options-link').click(function(){
            app.homeView.optionsView.render();
        });
        $('.sync-link').click(function(){
            app.service.sync();
        });
    }
    this.render = function(){
        // app.logEvent('render home view');
        if(this.currentList){
            this.renderFooter(this.currentList);
            this.listView.render(this.currentList.id);
        } else {
            throw new Error("No current list found");
        }
    }
    this.inputsToMap = function(form){
        var values = {};
        $.each(form.serializeArray(), function(i, field) {
            values[field.name] = field.value;
        });
        return values;
    }
}

var ListView = function(){ 
    this.service;
    this.editView    = new ListEditView();
    this.itemView    = new ItemView();
    this.itemAddView = new ItemAddView();
    this.renderTopListHelper = new RenderHelper();
    this.renderSubListHelper = new RenderHelper();
    this.initialize = function(service){
        this.service = service;
        this.renderTopListHelper.initialize(
            this.renderTopListHelper.templates.editableHeader,
            this.renderTopListHelper.templates.listContent
        );
        this.renderSubListHelper.initialize(
            this.renderSubListHelper.templates.editableSubHeader,
            this.renderSubListHelper.templates.listContent
        );
        this.editView.initialize(service);
        this.itemView.initialize(service);
        this.itemAddView.initialize(service);
        return this;
    }    
    this.renderHeader = function(list){
        if(list.hasParent()){
            this.renderSubListHelper.renderHeader(app.messages);
            $('.parent-link').click(function(){
                app.breadCrumbs.pop();
            });     
        } else {
            this.renderTopListHelper.renderHeader(app.messages);
        }
        $('.edit-link').click(function(){
            app.homeView.listView.editView.render(list.id);
        });   
    }
    this.renderContent = function(list){
        var filteredItems = list.orderedItems().filter(function(item){
            return item.quantity > 0;
        });
        var context = {
            title:       list.title,
            description: list.description,
            hasParent:   list.hasParent(),
            isOnList:    list.isOnList(),
            items:       filteredItems
        }
        this.renderTopListHelper.renderContent( context );
        $('#items li a').click(function(){
            var type   = $(this).data("itemtype"); 
            var itemId = $(this).data("itemid");    
            if(type == "ShoppingList"){
                app.homeView.listView.render(itemId);   
            } else {
                app.homeView.listView.itemView.render(list.id, itemId);    
            }
        });
        if(list.hasParent()){
            $('.item-add-link').click(function(){
                app.service.addItem(list.parent,list);
                app.breadCrumbs.pop(); 
            });
        }
    }
    this.render = function(listId){
        // app.logEvent('render list view');
        var list = this.service.findList(listId);
        if(list){
            // console.log('list id ' + list.id);
            if(!list.hasParent()){
                app.breadCrumbs.reset();
            }
            app.breadCrumbs.push(function(){
                app.homeView.listView.render(listId);
            });
            this.renderHeader(list);
            this.renderContent(list);
        } else {
            console.log("List not found");
        }
    }
}

var ItemView = function(){   
    this.service;
    this.editView = new ItemEditView();
    this.renderHelper = new RenderHelper();
    this.initialize = function(service){
        this.service = service;
        this.renderHelper.initialize(
            this.renderHelper.templates.editableSubHeader,
            this.renderHelper.templates.itemContent
        );
        this.editView.initialize(service);
        return this;
    }    
    this.renderHeader = function(list,item){
        // console.log('list id ' + list.id);
        // console.log('item id ' + item.id);
        this.renderHelper.renderHeader( app.messages );
        $('.parent-link').click(function(){               
            app.breadCrumbs.pop();
        });     
        $('.edit-link').click(function(){
            app.homeView.listView.itemView.editView.render(list.id,item.id);
        });   
    }
    this.renderContent = function(list,item){
        var context = {
            id:          item.id,
            item:        item,
            isOnList:    item.isOnList()
        };        
        this.renderHelper.renderContent( context );
        if(item.isOnList()){
            document.querySelector('#inBasketToggle').addEventListener('toggle', function (event) {
                var itemId    = $(this).data("itemid");   
                var item      = app.service.findItem(list,itemId); 
                item.inBasket = event.detail.isActive;
                app.service.updateItem(list,item);
                app.breadCrumbs.peek();
            });
        } 
        $('.item-add-link').click(function(){
            app.service.addItem(list,item);
            app.breadCrumbs.pop(); 
        });
    }
    this.render = function(listId,itemId){
        // app.logEvent('render item view');
        app.breadCrumbs.push(function(){
            app.homeView.listView.itemView.render(listId,itemId);
        });
        var list = this.service.findList(listId);
        if(list == null){
            throw new Error('List not found for id ' + listId);
        } else {
            // console.log('list id ' + list.id);
            var item = this.service.findItem(list,itemId);
            if(item==null){
                throw new Error('Item not found for id ' + itemId);
            } else {
                // console.log('item id ' + item.id);
                this.renderHeader(list,item);
                this.renderContent(list,item);
            }
        }
    }
}

var ListEditView = function(){
    this.service;
    this.renderHelper = new RenderHelper();
    this.initialize = function(service){
        this.service = service;
        this.renderHelper.initialize(
            this.renderHelper.templates.subHeader,
            this.renderHelper.templates.listEditContent
        );
        return this;
    }    
    this.renderHeader = function(list){
        this.renderHelper.renderHeader( app.messages );
        $('.parent-link').click(function(){                  
            app.breadCrumbs.pop();
        });   
    }
    this.renderContent = function(list){
        var context = {
            id:          list.id,
            title:       list.title,
            description: list.description,
            hasParent:   list.hasParent(),
            items:       list.items,
            parent:      list.parent,
            hasItemsInBasket: list.hasItemsInBasket()
        };
        this.renderHelper.renderContent( context );
        $('.item-edit-link').click(function(){
            var type   = $(this).data("itemtype"); 
            var itemId = $(this).data("itemid");    
            if(type == "ShoppingList"){
                app.homeView.listView.editView.render(itemId);    
            } else {
                app.homeView.listView.itemView.editView.render(list.id, itemId);    
            }
        });
        $('.item-remove-link').click(function(){
            var type   = $(this).data("itemtype"); 
            var itemId = $(this).data("itemid");    
            if(type == "ShoppingList"){
                var subList = app.service.findList(itemId);
                app.service.removeSubList(list,subList);    
            } else {
                var item = app.service.findItem(list,itemId);
                app.service.removeItem(list,item);                
            }
            app.breadCrumbs.peek();
            // $(this).parent().remove();

        });
        $('.item-find-link').click(function(){
            app.homeView.archiveView.render(list.id);
        });   
        $( ".list-update-form" ).submit(function( event ) {
            event.preventDefault();
            var inputs = app.homeView.inputsToMap($(this));
            // console.log( "Form inputs: " + inputs );
            var list   = app.service.findList( inputs.listId );
            if(list == null){
                throw new Error('List not found for id ' + inputs.listId );            
            } else {
                var parent = app.service.findList( inputs.parentId );
                if(parent == null || parent == undefined){
                    throw new Error('List not found for parent id ' + inputs.parentId);
                } else {
                    list.title       = inputs.title;
                    list.description = inputs.description;  
                    app.service.updateSubList(parent,list);
                    app.breadCrumbs.pop();
                }
            }
        });   
        $('.list-remove-link').click(function(){
            app.service.removeSubList(list.parent,list);
            app.breadCrumbs.doublePop();
        });  
        $('.item-purchased-remove-link').click(function(){
            var list = app.service.findList( list.id );
            app.service.removePurchasedItems(link);
            app.breadCrumbs.peek();
        });
    }
    this.render = function(listId){
        // app.logEvent('render list edit view');
        // console.log('list id ' + listId);        
        app.breadCrumbs.push(function(){
            app.homeView.listView.editView.render(listId);
        });
        var list = this.service.findList(listId);
        if(list == null){
            throw new Error('List not found for id ' + listId);
        } else {
            // console.log('list id ' + list.id);
            this.renderHeader(list);
            this.renderContent(list);
        }
    }
}

var ItemEditView = function(){
    this.service;
    this.renderHelper = new RenderHelper();
    this.initialize = function(service){
        this.service = service;
        this.renderHelper.initialize(
            this.renderHelper.templates.subHeader,
            this.renderHelper.templates.itemEditContent
        );
        return this;
    }    
    this.renderHeader = function(list,item){
        this.renderHelper.renderHeader( app.messages );
        $('.parent-link').click(function(){
            app.breadCrumbs.pop();
        });     
    }
    this.renderContent = function(list,item){
        this.renderHelper.renderContent( item );  
        $('.item-add-link').click(function(){
            app.homeView.listView.itemAddView.renderItemParent(list.id,item.id);
        });     
        $( ".item-update-form" ).submit(function( event ) {
            event.preventDefault();
            var inputs = app.homeView.inputsToMap($(this));
            // console.log( "Form inputs: " + inputs );
            var list = app.service.findList( inputs.listId );
            if(list == null){
                throw new Error('List not found for id ' + inputs.listId);
            } else {
                var item = app.service.findItem(list,inputs.itemId);
                if(item == null){
                    throw new Error('Item not found for id ' + inputs.itemId);
                } else {                        
                    item.title       = inputs.title;
                    item.description = inputs.description;    
                    item.quantity    = inputs.quantity;
                    app.service.updateItem(list,item);
                    // app.homeView.listView.editView.render(list.id);
                    app.breadCrumbs.pop();
                }
            }
        });
        $('.item-remove-link').click(function(){
            var item = app.service.findItem(list,$(this).data("itemid"));
            app.service.removeItem(list,item);
            // app.homeView.listView.editView.render(list.id);
            app.breadCrumbs.doublePop();
        });   
    }
    this.render = function(listId,itemId){
        // app.logEvent('render item edit view');     
        app.breadCrumbs.push(function(){
            app.homeView.listView.itemView.editView.render(listId,itemId);
        });
        var list = this.service.findList(listId);
        var item = this.service.findItem(list,itemId);
        this.renderHeader(list,item);
        this.renderContent(list,item);
    }
}

var ItemAddView = function(){   
    this.service;
    this.renderHelper = new RenderHelper();
    this.initialize = function(service){
        this.service = service;
        this.renderHelper.initialize(
            this.renderHelper.templates.subHeader,
            this.renderHelper.templates.itemAddContent
        );
        return this;
    }    
    this.renderListParentHeader = function(list){
        this.renderHelper.renderHeader( app.messages );
        $('.parent-link').click(function(){           
            app.breadCrumbs.pop();
        });     
    }
    this.renderItemParentHeader = function(item){
        this.renderHelper.renderHeader( app.messages );
        $('.parent-link').click(function(){           
            app.breadCrumbs.pop();
        });     
    }
    this.renderListParentContent = function(list){
        this.renderHelper.renderContent( list );
        $( ".item-add-form" ).submit(function( event ) {
            event.preventDefault();
            var inputs = app.homeView.inputsToMap($(this));
            var item   = app.service.createNewItem(inputs);
            app.service.addNewItem(list,item);
            app.breadCrumbs.unpush(); // remove add line
            app.homeView.listView.editView.render(list.id);
        });
        // $('.item-find-link').click(function(){
        //     app.homeView.archiveView.render(list.id);
        // });  
    }
    this.renderItemParentContent = function(list,subListItem){
        this.renderHelper.renderContent( subListItem );
        $( ".item-add-form" ).submit(function( event ) {
            event.preventDefault();
            var parentId = subListItem.id;
            var parentAsItem  = app.service.findItem(list,parentId);
            if(parentAsItem){
                var inputs    = app.homeView.inputsToMap($(this));
                var item      = app.service.createNewItem(inputs);
                app.service.convertToSubList(list,parentAsItem);
                var parentAsList = app.service.findList(parentId);
                if(parentAsList){
                    app.service.addNewItem(parentAsList,item);
                    app.breadCrumbs.unpush(); // remove add line
                    app.breadCrumbs.unpush(); // remove edit item
                    app.breadCrumbs.unpush(); // remove view item
                    app.breadCrumbs.push(function(){ // add view sub list
                        app.homeView.listView.render(parentId);
                    });
                    app.homeView.listView.editView.render(parentId);
                } else {
                    throw new Error("New sub list not found for id " + parentId);
                }
            }
        });
        // $('.item-find-link').click(function(){
        //     app.homeView.archiveView.render(list.id);
        // });  
    }
    this.renderListParent = function(listId){
        // app.logEvent('render item add view for list');
        app.breadCrumbs.push(function(){
            app.homeView.listView.itemAddView.renderListParent(listId);
        });
        var list = this.service.findList(listId);
        if(list == null){
            throw new Error('List not found for id ' + listId);
        } else {
            this.renderListParentHeader(list);
            this.renderListParentContent(list);
        }
    }
    this.renderItemParent = function(listId,itemId){
        // app.logEvent('render item add view for item');
        app.breadCrumbs.push(function(){
            app.homeView.listView.itemAddView.renderItemParent(listId,itemId);
        });
        var list = this.service.findList(listId);
        if(list == null){
            throw new Error('List not found for id ' + listId);
        } else {
            var item = this.service.findItem(list,itemId);
            if(item == null){
                throw new Error('Item not found for id ' + itemId);
            } else {
                this.renderItemParentHeader(item);
                this.renderItemParentContent(list,item);
            }
        }
    }
}

var ArchiveView = function(){   
    this.service;
    this.recentView   = new RecentView();
    this.searchView   = new SearchView();
    this.frequentView = new FrequentView();
    this.renderHelper = new RenderHelper();
    this.initialize = function(service){
        this.service = service;
        this.renderHelper.initialize(
            this.renderHelper.templates.subHeader,
            this.renderHelper.templates.archiveContent
        );
        this.recentView.initialize(service);
        this.searchView.initialize(service);
        this.frequentView.initialize(service);
        return this;
    }    
    this.renderHeader = function(list){
        this.renderHelper.renderHeader( app.messages );
        $('.parent-link').click(function(){
            app.breadCrumbs.pop();
        });     
    }
    this.renderContent = function(list){
        this.renderHelper.renderContent();
        $('.recent-link').click(function(){
            app.homeView.archiveView.recentView.render(list.id);
        });   
        $('.frequent-link').click(function(){
            app.homeView.archiveView.frequentView.render(list.id);
        });   
        $( ".search-form" ).submit(function( event ) {
            event.preventDefault();
            var inputs = app.homeView.inputsToMap($(this));
            app.homeView.archiveView.searchView.render(list.id,inputs.searchterm);
        });
        $('.item-add-link').click(function(){
            app.homeView.listView.itemAddView.renderListParent(list.id);
        });   
    }
    this.render = function(listId){
        // app.logEvent('render archive view');
        app.breadCrumbs.push(function(){
            app.homeView.archiveView.render(listId);
        });
        var list = this.service.findList(listId);
        this.renderHeader(list);
        this.renderContent(list);
    }
}

var RecentView = function(){   
    this.service;
    this.renderHelper = new RenderHelper();
    this.initialize = function(service){
        this.service = service;
        this.renderHelper.initialize(
            this.renderHelper.templates.subHeader,
            this.renderHelper.templates.itemFindContent,
            undefined,
            ["parentPath"]
        );
        return this;
    }    
    this.renderHeader = function(list){
        this.renderHelper.renderHeader( app.messages );
        $('.parent-link').click(function(){
            app.breadCrumbs.pop();
        });  
    }
    this.renderContent = function(list,recentItems){
        // console.log("Recent items found: "+ recentItems);
        var context = { 
            messages: app.messages,
            items: recentItems 
        };
        this.renderHelper.renderContent( context );
        $('.item-link').click(function(){
            var type   = $(this).data("itemtype"); 
            var itemId = $(this).data("itemid");    
            if(type == "ShoppingList"){
                app.homeView.listView.render(itemId);   
            } else {
                app.homeView.listView.itemView.render(list.id, itemId); 
            }   
        });
        $('.item-add-link').click(function(){
            var type   = $(this).data("itemtype"); 
            var itemId = $(this).data("itemid");    
            if(type == "ShoppingList"){
                var subList = app.service.findList(itemId);   
                if(subList){
                    app.service.addItem(list,subList); 
                }
            } else {
                var item = app.service.findItem(list, itemId);   
                if(item){
                    app.service.addItem(list,item);
                }
            }    
            app.breadCrumbs.peek();
        });    
    }
    this.render = function(listId){
        app.logEvent('render archive view');
        app.breadCrumbs.push(function(){
            app.homeView.archiveView.recentView.render(listId);
        });
        var list = this.service.findList(listId);
        var recentItems = this.service.filterRecentItems(list);
        this.renderHeader(list);
        this.renderContent(list,recentItems);
    }
}

var FrequentView = function(list){   
    this.service;
    this.renderHelper = new RenderHelper();
    this.initialize = function(service){
        this.service = service;
        this.renderHelper.initialize(
            this.renderHelper.templates.subHeader,
            this.renderHelper.templates.itemFindContent,
            undefined,
            ["parentPath"]
        );
        return this;
    }    
    this.renderHeader = function(list){
        this.renderHelper.renderHeader( app.messages );
        $('.parent-link').click(function(){
            app.breadCrumbs.pop();
        });  
    }
    this.renderContent = function(list,frequentItems){
        var context = {             
            messages: app.messages,
            items: frequentItems 
        };
        this.renderHelper.renderContent( context );
        $('.item-link').click(function(){
            var type   = $(this).data("itemtype"); 
            var itemId = $(this).data("itemid");    
            if(type == "ShoppingList"){
                app.homeView.listView.render(itemId);   
            } else {
                app.homeView.listView.itemView.render(list.id, itemId); 
            }   
        });  
        $('.item-add-link').click(function(){
            var type   = $(this).data("itemtype"); 
            var itemId = $(this).data("itemid");    
            if(type == "ShoppingList"){
                var subList = app.service.findList(itemId);   
                if(subList){
                    app.service.addItem(list,subList); 
                }
            } else {
                var item = app.service.findItem(list, itemId);   
                if(item){
                    app.service.addItem(list,item);
                }
            }   
            // $(this).parent().remove();
            app.breadCrumbs.peek();
        });    
    }
    this.render = function(listId){
        app.logEvent('render frequent view');
        app.breadCrumbs.push(function(){
            app.homeView.archiveView.frequentView.render(listId);
        });
        var list          = this.service.findList(listId);
        var frequentItems = this.service.filterFrequentItems(list) 
        this.renderHeader(list);
        this.renderContent(list,frequentItems);
    }
}

var SearchView = function(){   
    this.service;
    this.renderHelper = new RenderHelper();
    this.initialize = function(service){
        this.service = service;
        this.renderHelper.initialize(
            this.renderHelper.templates.subHeader,
            this.renderHelper.templates.searchContent,
            this.renderHelper.templates.itemFindContent,
            ["parentPath"]
        );
        return this;
    }    
    this.renderHeader = function(list){
        this.renderHelper.renderHeader( app.messages );
        $('.parent-link').click(function(){
            app.breadCrumbs.pop();
        });  
    }
    this.renderContent = function(list,searchItems,searchTerm){
        var context = { 
            messages: app.messages,
            items: searchItems,
            searchTerm: searchTerm 
        };
        this.renderHelper.renderContent(context);
        this.renderHelper.renderSelector('.content .item-find', context); 
        $( ".search-form" ).submit(function( event ) {
            event.preventDefault();
            var inputs = app.homeView.inputsToMap($(this));
            app.homeView.archiveView.searchView.render(list.id,inputs.searchterm);
        });
        $('.item-link').click(function(){
            var type   = $(this).data("itemtype"); 
            var itemId = $(this).data("itemid");    
            if(type == "ShoppingList"){
                app.homeView.listView.render(itemId);   
            } else {
                app.homeView.listView.itemView.render(list.id, itemId); 
            }   
        });  
        $('.item-add-link').click(function(){ 
            var type   = $(this).data("itemtype"); 
            var itemId = $(this).data("itemid"); 
            if(type == "ShoppingList"){
                var subList = app.service.findList(itemId);   
                if(subList){
                    if(subList.parent){
                        app.service.addItem(subList.parent,subList); 
                    } else {
                        app.service.addItem(list,subList); 
                    }
                }
            } else {
                var item = app.service.findItem(list, itemId);   
                if(item){
                    app.service.addItem(list,item);
                }
            }   
            // $(this).parent().remove();
            app.breadCrumbs.peek();
        }); 
    }
    this.render = function(listId,searchTerm){
        app.logEvent('render search view');
        app.breadCrumbs.push(function(){
            app.homeView.archiveView.searchView.render(listId,searchTerm);
        });
        var list        = this.service.findList(listId);
        var searchItems = this.service.searchForItems(list,searchTerm);
        this.renderHeader(list);
        this.renderContent(list,searchItems,searchTerm);
    }
}

var OptionsView = function(){   
    this.service;
    this.renderHelper = new RenderHelper();
    this.initialize = function(service){
        this.service = service;
        this.renderHelper.initialize(
            this.renderHelper.templates.plainHeader,
            this.renderHelper.templates.optionsContent
        );
        return this;
    }    
    this.renderHeader = function(){
        this.renderHelper.renderHeader( app.messages );
    }
    this.renderContent = function(){
        this.renderHelper.renderContent();
    }
    this.render = function(){
        app.logEvent('render options view');
        app.breadCrumbs.reset();
        this.renderHeader();
        this.renderContent();
    }
}
