function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

// Handle the "onReceive" event.
var onReceive = function (info) {
    console.log("got", info);
    console.log(ab2str(info.data));
};

var port = 10000;

chrome.sockets.udp.create({}, function (socketInfo) {

    // The socket is created, now we can send some data
    var socketId = socketInfo.socketId;
    var arrayBuffer = str2ab("Hey!");

    chrome.sockets.udp.bind(
        socketId,
        "0.0.0.0",
        port,
        function (result) {
            console.log("bind", result);
            if (result < 0) {
                console.log(chrome.runtime.lastError.message);
                console.log("Error binding socket.");
                return;
            }
            chrome.sockets.udp.send(
                socketId,
                arrayBuffer,
                '127.0.0.1',
                port,
                function (sendInfo) {
                    console.log("sent after bind", sendInfo);
                }
            );
        }
    );

    chrome.sockets.udp.send(
        socketId,
        arrayBuffer,
        '192.168.1.100',
        60223,
        function (sendInfo) {
            console.log("sent ", sendInfo);
        }
    );

    // Setup event handler and bind socket.
    chrome.sockets.udp.onReceive.addListener(onReceive);
});
