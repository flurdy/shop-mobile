
var renderHelper = {
    templates: {
        listHeader:       Handlebars.compile($("#list-header-template").html()),
        itemHeader:       Handlebars.compile($("#item-header-template").html()),
        itemSubHeader:    Handlebars.compile($("#item-sub-header-template").html()),
        listSubHeader:    Handlebars.compile($("#list-sub-header-template").html()),
        archiveSubHeader: Handlebars.compile($("#archive-sub-header-template").html()),
        listContent:      Handlebars.compile($("#list-content-template").html()),
        listEditContent:  Handlebars.compile($("#list-edit-content-template").html()),
        itemContent:      Handlebars.compile($("#item-content-template").html()),
        itemEditContent:  Handlebars.compile($("#item-edit-content-template").html()),
        itemAddContent:   Handlebars.compile($("#item-add-content-template").html()),
        archiveContent:   Handlebars.compile($("#archive-content-template").html()),
        optionsContent:   Handlebars.compile($("#options-content-template").html()),
        itemFindContent:  Handlebars.compile($("#item-find-template").html()),
        searchContent:    Handlebars.compile($("#search-content-template").html())
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

var ListView = function(){ 
    this.editView    = new ListEditView();
    this.itemView    = new ItemView();
    this.itemAddView = new ItemAddView();
    this.archiveView = new ArchiveView();
    this.optionsView = new OptionsView();
    this.initialize = function(){
        this.editView.initialize();
        this.itemView.initialize();
        this.itemAddView.initialize();
        this.archiveView.initialize();
        this.optionsView.initialize();
        return this;
    }    
    this.renderHeader = function(){
        renderHelper.renderHeader( renderHelper.templates.listHeader() );
        $('.list-edit-link').click(function(){
            listView.editView.render();
        });   
    }
    this.renderFooter = function(){
        $('.index-link').click(function(){
            listView.render();
        });   
        $('.archive-link').click(function(){
            listView.archiveView.render();
        });   
        $('.options-link').click(function(){
            listView.optionsView.render();
        });
    }
    this.renderContent = function(){
        renderHelper.renderContent( renderHelper.templates.listContent() );
        $('#items li a').click(function(){
            listView.itemView.render();
        });
    }
    this.render = function(){
        app.logEvent('render list view');
        this.renderHeader();
        this.renderFooter();
        this.renderContent();
    }
}

var ListEditView = function(){
    this.initialize = function(){
        return this;
    }    
    this.renderHeader = function(){
        renderHelper.renderHeader( renderHelper.templates.listSubHeader() );
        $('.list-link').click(function(){
            listView.render();
        });   
    }
    this.renderContent = function(){
        renderHelper.renderContent( renderHelper.templates.listEditContent() );
        $('.item-add-link').click(function(){
            listView.itemAddView.render();
        });   
    }
    this.render = function(){
        app.logEvent('render list edit view');
        this.renderHeader();
        this.renderContent();
    }
}

var ItemView = function(item){   
    this.editView = new ItemEditView();
    this.initialize = function(){
        this.editView.initialize();
        return this;
    }    
    this.renderHeader = function(){
        renderHelper.renderHeader( renderHelper.templates.itemHeader() );
        $('.list-link').click(function(){
            listView.render();
        });     
        $('.item-edit-link').click(function(){
            listView.itemView.editView.render();
        });   
    }
    this.renderContent = function(){
        renderHelper.renderContent( renderHelper.templates.itemContent() );
    }
    this.render = function(){
        app.logEvent('render item view');
        this.renderHeader();
        this.renderContent();
    }
}

var ItemEditView = function(item){   
    this.initialize = function(){
        return this;
    }    
    this.renderHeader = function(){
        renderHelper.renderHeader( renderHelper.templates.itemSubHeader() );
        $('.item-link').click(function(){
            listView.itemView.render();
        });     
    }
    this.renderContent = function(){
        renderHelper.renderContent( renderHelper.templates.itemEditContent() );        
        $('.item-add-link').click(function(){
            listView.itemAddView.render();
        });   
    }
    this.render = function(){
        app.logEvent('render item edit view');
        this.renderHeader();
        this.renderContent();
    }
}

var ItemAddView = function(item){   
    this.initialize = function(){
        return this;
    }    
    this.renderHeader = function(){
        renderHelper.renderHeader( renderHelper.templates.listSubHeader() );
        $('.list-link').click(function(){
            listView.render();
        });     
    }
    this.renderContent = function(){
        renderHelper.renderContent( renderHelper.templates.itemAddContent() );        
    }
    this.render = function(){
        app.logEvent('render item add view');
        this.renderHeader();
        this.renderContent();
    }
}

var ArchiveView = function(){   
    this.recentView   = new RecentView();
    this.searchView   = new SearchView();
    this.frequentView = new FrequentView();
    this.initialize = function(){
        this.recentView.initialize();
        this.searchView.initialize();
        this.frequentView.initialize();
        return this;
    }    
    this.renderHeader = function(){
        renderHelper.renderHeader( renderHelper.templates.listSubHeader() );
        $('.list-link').click(function(){
            listView.render();
        });     
    }
    this.renderContent = function(){
        renderHelper.renderContent( renderHelper.templates.archiveContent() );
        $('.recent-link').click(function(){
            listView.archiveView.recentView.render();
        });   
        $('.frequent-link').click(function(){
            listView.archiveView.frequentView.render();
        });   
        $( ".search-form" ).submit(function( event ) {
            event.preventDefault();
            listView.archiveView.searchView.render();
        });
    }
    this.render = function(){
        app.logEvent('render archive view');
        this.renderHeader();
        this.renderContent();
    }
}

var RecentView = function(){   
    this.initialize = function(){
        return this;
    }    
    this.renderHeader = function(){
        renderHelper.renderHeader( renderHelper.templates.archiveSubHeader() );   
        $('.archive-link').click(function(){
            listView.archiveView.render();
        });  
    }
    this.renderContent = function(){
        renderHelper.renderContent( renderHelper.templates.itemFindContent() );
        $('.item-link').click(function(){
            listView.itemView.render();
        });  
        $('.item-add-link').click(function(){
            listView.itemAddView.render();
        });    
    }
    this.render = function(){
        app.logEvent('render archive view');
        this.renderHeader();
        this.renderContent();
    }
}

var SearchView = function(){   
    this.initialize = function(){
        return this;
    }    
    this.renderHeader = function(){
        renderHelper.renderHeader( renderHelper.templates.archiveSubHeader() );   
        $('.archive-link').click(function(){
            listView.archiveView.render();
        });  
    }
    this.renderContent = function(){
        renderHelper.renderContent( renderHelper.templates.searchContent() );     
        $( ".search-form" ).submit(function( event ) {
            event.preventDefault();
            listView.searchView.render();
        });
        renderHelper.renderSelector('.content .item-find', renderHelper.templates.itemFindContent()); 
        $('.item-link').click(function(){
            listView.itemView.render();
        });  
        $('.item-add-link').click(function(){
            listView.itemAddView.render();
        }); 
    }
    this.render = function(){
        app.logEvent('render search view');
        this.renderHeader();
        this.renderContent();
    }
}

var FrequentView = function(){   
    this.initialize = function(){
        return this;
    }    
    this.renderHeader = function(){
        renderHelper.renderHeader( renderHelper.templates.archiveSubHeader() );   
        $('.archive-link').click(function(){
            listView.archiveView.render();
        });  
    }
    this.renderContent = function(){
        renderHelper.renderContent( renderHelper.templates.itemFindContent() );
        $('.item-link').click(function(){
            listView.itemView.render();
        });  
        $('.item-add-link').click(function(){
            listView.itemAddView.render();
        });    
    }
    this.render = function(){
        app.logEvent('render frequent view');
        this.renderHeader();
        this.renderContent();
    }
}

var OptionsView = function(){   
    this.initialize = function(){
        return this;
    }    
    this.renderHeader = function(){
        renderHelper.renderHeader( renderHelper.templates.listSubHeader() );
        $('.list-link').click(function(){
            listView.render();
        });     
    }
    this.renderContent = function(){
        renderHelper.renderContent( renderHelper.templates.optionsContent() );
    }
    this.render = function(){
        app.logEvent('render options view');
        this.renderHeader();
        this.renderContent();
    }
}


var listView = new ListView();


// Main application logic
var app = {

    initialize: function() {
        this.bindEvents();        
        listView.initialize();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', app.onDeviceReady, false);
    },

    onAppLoad: function(){        
        app.logEvent('app loaded');
        if(typeof cordova === 'undefined'){
            this.renderFirstPage();
        }
    },

    onDeviceReady: function() {
        app.logEvent('deviceready');
        FastClick.attach(document.body);
        app.renderFirstPage();
    },

    logEvent: function(id) {
        console.log('Received Event: ' + id);
    },

    renderFirstPage: function(){
        listView.render();
    },

};

app.initialize();

// For running in desktop browser
(function () {
    app.onAppLoad();
}());

