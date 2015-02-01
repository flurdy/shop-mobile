var renderHelper = {
    compile: function(template){
        return Handlebars.compile($(template).html());
    },
    templates: {
        plainHeader: function(){
            return renderHelper.compile("#plain-header-template");
        },
        editableHeader: function(){
            return renderHelper.compile("#editable-header-template");
        },
        subHeader: function(){
            return renderHelper.compile("#sub-header-template");
        },
        editableSubHeader: function(){ 
            return renderHelper.compile("#editable-sub-header-template");
        },
        listContent: function(){
            return renderHelper.compile("#list-content-template");
        },
        listEditContent: function(){ 
            return renderHelper.compile("#list-edit-content-template");
        },
        itemContent: function(){ 
            return renderHelper.compile("#item-content-template");
        },
        itemEditContent: function(){
            return renderHelper.compile("#item-edit-content-template");
        },
        itemAddContent: function(){ 
            return renderHelper.compile("#item-add-content-template");
        },
        archiveContent: function(){ 
            return renderHelper.compile("#archive-content-template");
        },
        optionsContent: function(){ 
            return renderHelper.compile("#options-content-template");
        },
        itemFindContent: function(){
            return renderHelper.compile("#item-find-template");
        },
        searchContent: function(){ 
            return renderHelper.compile("#search-content-template");
        }
    },
    renderBody: function(html){
       $('body').html(html); 
    },
    renderHeader: function(html){
       $('#header').html(html); 
    },
    renderFooter: function(html){
       $('#footer').html(html); 
    },
    renderContent: function(html){
       $('.content').html(html); 
    },
    renderSelector: function(selector,html){
       $(selector).html(html); 
    },
    renderElement: function(element,selector,html){
       element.find(selector).html(html); 
    }
}

var HomeView = function(){ 
    this.service;
    this.listView    = new ListView();
    this.optionsView = new OptionsView();
    this.archiveView = new ArchiveView();
    this.currentList;
    this.headerTemplate = "<div/>";
    this.initialize = function(service){
        this.service = service;
        this.listView.initialize(this.service);
        this.optionsView.initialize(service);
        this.archiveView.initialize(service);
        this.currentList = this.service.findDefaultList();
        this.headerTemplate = renderHelper.templates.plainHeader();
    }
    this.renderHeader = function(){
        renderHelper.renderHeader( this.headerTemplate(app.messages) );
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
        app.logEvent('render home view');
        this.renderFooter(this.currentList);
        this.listView.render(this.currentList.id);
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
    this.headerTemplate    = "<div/>";
    this.headerTemplateSub = "<div/>";
    this.contentTemplate   = "<div/>";
    this.initialize = function(service){
        this.service = service;
        this.headerTemplate  = renderHelper.templates.editableHeader();
        this.headerTemplateSub  = renderHelper.templates.editableSubHeader();
        this.contentTemplate  = renderHelper.templates.listContent();
        this.editView.initialize(service);
        this.itemView.initialize(service);
        this.itemAddView.initialize(service);
        return this;
    }    
    this.renderHeader = function(list){
        if(list.hasParent()){
            renderHelper.renderHeader( this.headerTemplateSub(app.messages) );
            $('.parent-link').click(function(){
                // app.homeView.listView.render(list.parent.id);
                app.breadCrumbs.pop();
            });     
        } else {
            renderHelper.renderHeader( this.headerTemplate(app.messages) );
        }
        $('.edit-link').click(function(){
            app.homeView.listView.editView.render(list.id);
        });   
    }
    this.renderContent = function(list){
        var filteredItems = list.items.filter(function(item){
            return item.quantity > 0;
        });
        var context = {
            title:       list.title,
            description: list.description,
            hasParent:   list.hasParent(),
            items:       filteredItems
        }
        renderHelper.renderContent( this.contentTemplate( context ) );
        $('#items li a').click(function(){
            var type   = $(this).data("itemtype"); 
            var itemId = $(this).data("itemid");    
            if(type == "ShoppingList"){
                app.homeView.listView.render(itemId);   
            } else {
                app.homeView.listView.itemView.render(list.id, itemId);    
            }
        });
    }
    this.render = function(listId){
        app.logEvent('render list view');
        var list = this.service.findList(listId);
        console.log('list id ' + list.id);
        if(!list.hasParent()){
            app.breadCrumbs.reset();
        }
        app.breadCrumbs.push(function(){
            app.homeView.listView.render(listId);
        });
        this.renderHeader(list);
        this.renderContent(list);
    }
}

var ItemView = function(){   
    this.service;
    this.editView = new ItemEditView();
    this.headerTemplate  = "<div/>";
    this.contentTemplate = "<div/>";
    this.initialize = function(service){
        this.service = service;
        this.headerTemplate  = renderHelper.templates.editableSubHeader();
        this.contentTemplate = renderHelper.templates.itemContent();
        this.editView.initialize(service);
        return this;
    }    
    this.renderHeader = function(list,item){
        console.log('list id ' + list.id);
        console.log('item id ' + item.id);
        renderHelper.renderHeader( this.headerTemplate(app.messages) );
        $('.parent-link').click(function(){
            // app.homeView.listView.render(list.id);                   
            app.breadCrumbs.pop();
        });     
        $('.edit-link').click(function(){
            app.homeView.listView.itemView.editView.render(list.id,item.id);
        });   
    }
    this.renderContent = function(list,item){
        renderHelper.renderContent( this.contentTemplate(item) );
    }
    this.render = function(listId,itemId){
        app.logEvent('render item view');
        app.breadCrumbs.push(function(){
            app.homeView.listView.itemView.render(listId,itemId);
        });
        var list = this.service.findList(listId);
        if(list == null){
            console.log('List not found for id ' + listId);
        } else {
            console.log('list id ' + list.id);
            var item = this.service.findItem(list,itemId);
            if(item==null){
                console.log('Item not found for id ' + itemId);
            } else {
                console.log('item id ' + item.id);
                this.renderHeader(list,item);
                this.renderContent(list,item);
            }
        }
    }
}

var ListEditView = function(){
    this.service;
    this.headerTemplate  = "<div/>";
    this.contentTemplate = "<div/>";
    this.initialize = function(service){
        this.service = service;
        this.headerTemplate  = renderHelper.templates.subHeader();
        this.contentTemplate = renderHelper.templates.listEditContent();
        return this;
    }    
    this.renderHeader = function(list){
        renderHelper.renderHeader( this.headerTemplate(app.messages) );
        $('.parent-link').click(function(){
            // app.homeView.listView.render(list.id);                      
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
            parent:      list.parent 
        };
        renderHelper.renderContent( this.contentTemplate( context ) );
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
            $(this).parent().remove();

        });
        $('.item-add-link').click(function(){
            app.homeView.listView.itemAddView.renderListParent(list.id);
        });   
        $('.item-find-link').click(function(){
            app.homeView.archiveView.render(list.id);
        });   
        $( ".list-update-form" ).submit(function( event ) {
            event.preventDefault();
            var inputs = app.homeView.inputsToMap($(this));
            console.log( "Form inputs: " + inputs );
            var list   = app.service.findList( inputs.listId );
            if(list == null){
                console.log('List not found for id ' + inputs.listId );            
            } else {
                var parent = app.service.findList( inputs.parentId );
                if(parent == null){
                    console.log('List not found for parent id ' + inputs.parentId);
                } else {
                    list.title       = inputs.title;
                    list.description = inputs.description;  
                    app.service.updateSubList(parent,list);
                    app.breadCrumbs.peek();
                }
            }
        });    
        $('.item-purchased-remove-link').click(function(){
            var list = app.service.findList( list.id );
            app.service.removePurchasedItems(link);
            app.breadCrumbs.peek();
        });
    }
    this.render = function(listId){
        app.logEvent('render list edit view');
        console.log('list id ' + listId);        
        app.breadCrumbs.push(function(){
            app.homeView.listView.editView.render(listId);
        });
        var list = this.service.findList(listId);
        if(list == null){
            console.log('List not found for id ' + listId);
        } else {
            console.log('list id ' + list.id);
            this.renderHeader(list);
            this.renderContent(list);
        }
    }
}

var ItemEditView = function(){
    this.service;
    this.headerTemplate  = "<div/>";
    this.contentTemplate = "<div/>";
    this.initialize = function(service){
        this.service = service;
        this.headerTemplate  = renderHelper.templates.subHeader();
        this.contentTemplate = renderHelper.templates.itemEditContent();
        return this;
    }    
    this.renderHeader = function(list,item){
        renderHelper.renderHeader( this.headerTemplate(app.messages) );
        $('.parent-link').click(function(){
            app.breadCrumbs.pop();
            // app.homeView.listView.itemView.render(list.id,item.id);
        });     
    }
    this.renderContent = function(list,item){
        renderHelper.renderContent( this.contentTemplate(item) );  
        $('.item-add-link').click(function(){
            // app.service.convertToSubList(list,item);
            app.homeView.listView.itemAddView.renderItemParent(list.id,item.id);
        });     
        $( ".item-update-form" ).submit(function( event ) {
            event.preventDefault();
            var inputs = app.homeView.inputsToMap($(this));
            console.log( "Form inputs: " + inputs );
            var list = app.service.findList( inputs.listId );
            if(list == null){
                console.log('List not found for id ' + inputs.listId);
            } else {
                var item = app.service.findItem(list,inputs.itemId);
                if(item == null){
                    console.log('Item not found for id ' + inputs.itemId);
                } else {                        
                    item.title       = inputs.title;
                    item.description = inputs.description;    
                    item.quantity    = inputs.quantity;
                    app.service.updateItem(list,item);
                    app.homeView.listView.editView.render(list.id);
                }
            }
        });
        $('.item-remove-link').click(function(){
            var item = app.service.findItem(list,$(this).data("itemid"));
            app.service.removeItem(list,item);
            app.homeView.listView.editView.render(list.id);
        });   
    }
    this.render = function(listId,itemId){
        app.logEvent('render item edit view');     
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
    this.headerTemplate  = "<div/>";
    this.contentTemplate = "<div/>";
    this.initialize = function(service){
        this.service = service;
        this.headerTemplate  = renderHelper.templates.subHeader();
        this.contentTemplate = renderHelper.templates.itemAddContent();
        return this;
    }    
    this.renderListParentHeader = function(list){
        renderHelper.renderHeader( this.headerTemplate(app.messages) );
        $('.parent-link').click(function(){
            // app.homeView.listView.editView.render(list.id);            
            app.breadCrumbs.pop();
        });     
    }
    this.renderItemParentHeader = function(item){
        renderHelper.renderHeader( this.headerTemplate(app.messages) );
        $('.parent-link').click(function(){
            // app.homeView.listView.itemView.editView.render(item.id);            
            app.breadCrumbs.pop();
        });     
    }
    this.renderListParentContent = function(list){
        renderHelper.renderContent( this.contentTemplate(list) );
        $( ".item-add-form" ).submit(function( event ) {
            event.preventDefault();
            var inputs = app.homeView.inputsToMap($(this));
            var item   = app.service.createNewItem(inputs);
            app.service.addNewItem(list,item);
            app.homeView.listView.editView.render(list.id);
        });
        $('.item-find-link').click(function(){
            app.homeView.archiveView.render(list.id);
        });  
    }
    this.renderItemParentContent = function(list,subListItem){
        renderHelper.renderContent( this.contentTemplate(subListItem) );
        $( ".item-add-form" ).submit(function( event ) {
            event.preventDefault();
            var inputs  = app.homeView.inputsToMap($(this));
            var item    = app.service.createNewItem(inputs);
            var subList = app.service.convertToSubList(list,subListItem);
            app.service.addNewItem(subList,item);
            app.homeView.listView.editView.render(subList.id);
        });
        $('.item-find-link').click(function(){
            app.homeView.archiveView.render(list.id);
        });  
    }
    this.renderListParent = function(listId){
        app.logEvent('render item add view for list');
        app.breadCrumbs.push(function(){
            app.homeView.itemAddView.renderListParent(listId);
        });
        var list = this.service.findList(listId);
        if(list == null){
            console.log('List not found for id ' + listId);
        } else {
            this.renderListParentHeader(list);
            this.renderListParentContent(list);
        }
    }
    this.renderItemParent = function(listId,itemId){
        app.logEvent('render item add view for item');
        app.breadCrumbs.push(function(){
            app.homeView.itemAddView.renderItemParent(listId,itemId);
        });
        var list = this.service.findList(listId);
        if(list == null){
            console.log('List not found for id ' + listId);
        } else {
            var item = this.service.findItem(itemId);
            if(list == null){
                console.log('Item not found for id ' + itemId);
            } else {
                this.renderItemParentHeader(item);
                this.renderItemParentContent(list,item);
            }
        }
    }
}

var ArchiveView = function(){   
    this.service;
    this.recentView      = new RecentView();
    this.searchView      = new SearchView();
    this.frequentView    = new FrequentView();
    this.headerTemplate  = "<div/>";
    this.contentTemplate = "<div/>";
    this.initialize = function(service){
        this.service = service;
        this.headerTemplate  = renderHelper.templates.subHeader();
        this.contentTemplate = renderHelper.templates.archiveContent();
        this.recentView.initialize(service);
        this.searchView.initialize(service);
        this.frequentView.initialize(service);
        return this;
    }    
    this.renderHeader = function(list){
        renderHelper.renderHeader( this.headerTemplate(app.messages) );
        $('.parent-link').click(function(){
            app.breadCrumbs.pop();
        });     
    }
    this.renderContent = function(list){
        renderHelper.renderContent( this.contentTemplate );
        $('.recent-link').click(function(){
            app.homeView.archiveView.recentView.render(list.id);
        });   
        $('.frequent-link').click(function(){
            app.homeView.archiveView.frequentView.render(list.id);
        });   
        $( ".search-form" ).submit(function( event ) {
            event.preventDefault();
            app.homeView.archiveView.searchView.render(list.id);
        });
    }
    this.render = function(listId){
        app.logEvent('render archive view');
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
    this.headerTemplate  = "<div/>";
    this.contentTemplate = "<div/>";
    this.initialize = function(service){
        this.service = service;
        this.headerTemplate  = renderHelper.templates.subHeader();
        this.contentTemplate = renderHelper.templates.itemFindContent();
        return this;
    }    
    this.renderHeader = function(list){
        renderHelper.renderHeader( this.headerTemplate(app.messages) );
        $('.parent-link').click(function(){
            // app.homeView.archiveView.render(list.id);
            app.breadCrumbs.pop();
        });  
    }
    this.renderContent = function(list){
        var recentItems = { items: this.service.findRecentItems(list) };
        renderHelper.renderContent( this.contentTemplate(recentItems) );
        $('.item-link').click(function(){
            app.homeView.listView.itemView.render(
                list.id, $(this).data("itemid"));    
        });
        $('.item-add-link').click(function(){
            var item = app.service.findItem(list, $(this).data("itemid"));   
            app.service.addItem(list,item);
            $(this).parent().remove();
        });    
    }
    this.render = function(listId){
        app.logEvent('render archive view');
        app.breadCrumbs.push(function(){
            app.homeView.archiveView.recentView.render(listId);
        });
        var list = this.service.findList(listId);
        this.renderHeader(list);
        this.renderContent(list);
    }
}

var FrequentView = function(list){   
    this.service;
    this.headerTemplate  = "<div/>";
    this.contentTemplate = "<div/>";
    this.initialize = function(service){
        this.service = service;
        this.headerTemplate  = renderHelper.templates.subHeader();
        this.contentTemplate = renderHelper.templates.itemFindContent();
        return this;
    }    
    this.renderHeader = function(list){
        renderHelper.renderHeader( this.headerTemplate(app.messages) );
        $('.parent-link').click(function(){
            // app.homeView.archiveView.render(list.id);
            app.breadCrumbs.pop();
        });  
    }
    this.renderContent = function(list){
        var frequentItems = { items: this.service.findFrequentItems(list) };
        renderHelper.renderContent( this.contentTemplate(frequentItems) );
        $('.item-link').click(function(){
            app.homeView.listView.itemView.render(
                list.id, $(this).data("itemid"));    
        });  
        $('.item-add-link').click(function(){
            var item = app.service.findItem(list, $(this).data("itemid"));   
            app.service.addItem(list,item);
            $(this).parent().remove();
        });    
    }
    this.render = function(listId){
        app.logEvent('render frequent view');
        app.breadCrumbs.push(function(){
            app.homeView.archiveView.frequentView.render(listId);
        });
        var list = this.service.findList(listId);
        this.renderHeader(list);
        this.renderContent(list);
    }
}

var SearchView = function(){   
    this.service;
    this.headerTemplate  = "<div/>";
    this.contentTemplate = "<div/>";
    this.elementTemplate = "<div/>";
    this.initialize = function(service){
        this.service = service;
        this.headerTemplate  = renderHelper.templates.subHeader();
        this.contentTemplate = renderHelper.templates.searchContent();
        this.elementTemplate = renderHelper.templates.itemFindContent();
        return this;
    }    
    this.renderHeader = function(list){
        renderHelper.renderHeader( this.headerTemplate(app.messages) );
        $('.parent-link').click(function(){
            // app.homeView.archiveView.render(list.id);
            app.breadCrumbs.pop();
        });  
    }
    this.renderContent = function(list,searchTerm){
        renderHelper.renderContent( this.contentTemplate );
        var searchItems = { items: this.service.searchForItems(list,searchTerm) };
        renderHelper.renderSelector('.content .item-find', 
                    this.elementTemplate(searchItems) ); 
        $( ".search-form" ).submit(function( event ) {
            event.preventDefault();
            app.homeView.archiveView.searchView.render(list.id);
        });
        $('.item-link').click(function(){
            app.homeView.listView.itemView.render(
                list.id, $(this).data("itemid"));
        });  
        $('.item-add-link').click(function(){
            var item = app.service.findItem(list, $(this).data("itemid"));   
            app.service.addItem(list,item);
            $(this).parent().remove();
        }); 
    }
    this.render = function(listId,searchTerm){
        app.logEvent('render search view');
        app.breadCrumbs.push(function(){
            app.homeView.archiveView.searchView.render(listId,searchTerm);
        });
        var list = this.service.findList(listId);
        this.renderHeader(list);
        this.renderContent(list,searchTerm);
    }
}

var OptionsView = function(){   
    this.service;
    this.headerTemplate  = "<div/>";
    this.contentTemplate = "<div/>";
    this.initialize = function(service){
        this.service = service;
        this.headerTemplate  = renderHelper.templates.plainHeader();
        this.contentTemplate = renderHelper.templates.optionsContent();
        return this;
    }    
    this.renderHeader = function(){
        renderHelper.renderHeader( this.headerTemplate(app.messages) );
    }
    this.renderContent = function(){
        renderHelper.renderContent( this.contentTemplate );
    }
    this.render = function(){
        app.logEvent('render options view');
        app.breadCrumbs.reset();
        this.renderHeader();
        this.renderContent();
    }
}
