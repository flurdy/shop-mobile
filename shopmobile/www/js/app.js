// Main application logic

var app = {

    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onAppLoad: function(){        
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

    templates: {
        listHeader:      Handlebars.compile($("#list-header-template").html()),
        listContent:     Handlebars.compile($("#list-content-template").html()),
        listEditContent: Handlebars.compile($("#list-edit-content-template").html()),
        itemHeader:      Handlebars.compile($("#item-header-template").html()),
        itemContent:     Handlebars.compile($("#item-content-template").html()),
        itemEditHeader:  Handlebars.compile($("#item-edit-header-template").html()),
        itemEditContent: Handlebars.compile($("#item-edit-content-template").html()),
        itemAddContent:  Handlebars.compile($("#item-add-content-template").html()),
        archiveHeader:   Handlebars.compile($("#archive-header-template").html()),
        archiveContent:  Handlebars.compile($("#archive-content-template").html()),
        optionsContent:  Handlebars.compile($("#options-content-template").html()),
        recentHeader:    Handlebars.compile($("#recent-header-template").html()),
        itemFindContent: Handlebars.compile($("#item-find-template").html()),
        searchContent:   Handlebars.compile($("#search-content-template").html())
    },

    renderFirstPage: function(){
        this.logEvent('render first page');
        this.renderListView();        
        $('#footer li.index-link').click(function(){
            app.renderListView();
        });   
        $('#footer li.archive-link').click(function(){
            app.renderArchiveView();
        });   
        $('#footer li.options-link').click(function(){
            app.renderOptionsView();
        });
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

    renderListView: function(){
        this.logEvent('render list view');
        this.renderListHeader();
        this.renderListContent();
    },
    renderListHeader: function(){
        this.renderHeader( this.templates.listHeader() );   
        $('.list-edit-link').click(function(){
            app.renderListEditView();
        });   
    },
    renderListContent: function(){
        this.renderContent( this.templates.listContent() );
        $('#items li a').click(function(){
            app.renderItemView();
        });
    },

    renderItemView: function(){
        this.logEvent('render item view');
        this.renderItemHeader();
        this.renderItemContent();
    },
    renderItemHeader: function(){
        this.renderHeader( this.templates.itemHeader() );   
        $('.list-link').click(function(){
            app.renderListView();
        });     
        $('.item-edit-link').click(function(){
            app.renderItemEditView();
        });   
    },
    renderItemContent: function(){
        this.renderContent( this.templates.itemContent() );
    },

    renderItemEditView: function(){
        this.logEvent('render item edit view');
        this.renderItemEditHeader();
        this.renderItemEditContent();
    },
    renderItemEditHeader: function(){
        this.renderHeader( this.templates.itemEditHeader() );   
        $('.item-link').click(function(){
            app.renderItemView();
        });   
    },
    renderItemEditContent: function(){
        this.renderContent( this.templates.itemEditContent() );
        $('.item-add-link').click(function(){
            app.renderItemAddView();
        });   
    },

    renderItemAddView: function(){
        this.logEvent('render item add view');
        this.renderArchiveHeader();
        this.renderItemAddContent();
    },
    renderItemAddContent: function(){
        this.renderContent( this.templates.itemAddContent() );
    },

    renderArchiveView: function(){
        this.logEvent('render archive view');
        this.renderArchiveHeader();
        this.renderArchiveContent();
    },
    renderArchiveHeader: function(){
        this.renderHeader( this.templates.archiveHeader() );   
        $('.list-link').click(function(){
            app.renderListView();
        });     
    },
    renderArchiveContent: function(){
        this.renderContent( this.templates.archiveContent() );
        $('.recent-link').click(function(){
            app.renderRecentView();
        });   
        $('.frequent-link').click(function(){
            app.renderFrequentView();
        });   
        $( ".search-form" ).submit(function( event ) {
            event.preventDefault();
            app.renderSearchView();
        });
    },

    renderOptionsView: function(){
        this.logEvent('render options view');
        this.renderArchiveHeader();
        this.renderOptionsContent();
    },
    renderOptionsContent: function(){
        this.renderContent( this.templates.optionsContent() );
    },

    renderListEditView: function(){
        this.logEvent('render list edit view');
        this.renderArchiveHeader();
        this.renderListEditContent();
    },
    renderListEditContent: function(){
        this.renderContent( this.templates.listEditContent() );
        $('.item-add-link').click(function(){
            app.renderItemAddView();
        });   
    },
    
    renderRecentView: function(){
        this.logEvent('render recent view');
        this.renderRecentHeader();
        this.renderRecentContent();
    },
    renderRecentHeader: function(){
        this.renderHeader( this.templates.recentHeader() );   
        $('.archive-link').click(function(){
            app.renderArchiveView();
        });     
    },
    renderRecentContent: function(){
        this.renderContent( this.templates.itemFindContent() );
        $('.item-link').click(function(){
            app.renderItemView();
        });  
        $('.item-add-link').click(function(){
            app.renderItemAddView();
        });     
    },

    renderFrequentView: function(){
        this.logEvent('render frequent view');
        this.renderRecentHeader();
        this.renderRecentContent(); 
    },

    renderItemFindView: function(){
        this.logEvent('render item find view');
        this.renderRecentHeader();
        this.renderItemFindContent(); 
    },
    renderItemFindContent: function(){
        this.renderContent( this.templates.itemFindContent() );
    },

    renderSearchView: function(){
        this.logEvent('render search view');
        this.renderRecentHeader();
        this.renderSearchContent(); 
    },
    renderSearchContent: function(){
        this.renderContent( this.templates.searchContent() );     
        $( ".search-form" ).submit(function( event ) {
            event.preventDefault();
            app.renderSearchView();
        });
        $('.content .item-find').html(this.templates.itemFindContent()); 
        $('.item-link').click(function(){
            app.renderItemView();
        });  
        $('.item-add-link').click(function(){
            app.renderItemAddView();
        }); 
    },

};

app.initialize();

// For running in desktop browser
(function () {
    app.onAppLoad();
}());

