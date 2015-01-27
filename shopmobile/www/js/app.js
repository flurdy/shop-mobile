
// Main application logic
var app = {
    
    isCordova: typeof cordova !== 'undefined',

    messages: {
        title: "Shop"
    },

    adapter: new ShopAdapter(),
    
    service: new ShopService(),

    homeView: new HomeView(),

    initialize: function() {
        this.bindEvents();   
        this.service.initialize(this.adapter);     
        this.homeView.initialize(this.service);
    },

    bindEvents: function() {
        document.addEventListener('deviceready', app.onDeviceReady, false);
    },

    onAppLoad: function(){        
        this.logEvent('app loaded');
        if(!this.isCordova){
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
        this.homeView.render();
    },

};

app.initialize();

// For running in desktop browser
(function () {
    app.onAppLoad();
}());

