
var app = {
    // Application Constructor
    initialize: function() {        
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        $(this.onDeviceReady);        
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
		new Scene();
//        if (getDeviceType() != "desktop") {
//            punch();
//        }
    }
};


function punch() {
    udptransmit.sendto("punch?", "www.leithall.com", 9000);
    udptransmit.recvfrom(function(data) { 
        var message = data.message;
        var host = data.host;
        var port = data.port;
        
        udptransmit.sendto("punch!", host, port);
        udptransmit.sendto("punch!", host, port);
        
        udptransmit.recvfrom(function(data) {
            console.log(data);
        });
    });
}

// ready to start
app.initialize();