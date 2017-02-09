/**
 * Created by ES on 09.02.2017.
 */


//var socket = io("http://nuclear.t.javascript.ninja", {
//    transports: ['websocket', 'xhr-polling']
//});
 var socket = io("http://localhost:3000");
//ws://nuclear.t.javascript.ninja

socket.on("disconnect", function() {
    setTitle("Disconnected");
});

socket.on("connect", function() {
    console.log('THIS NEVER RUNS????');
    setTitle("Connected to Cyber Chat");
});

socket.on("message", function(message) {
    console.log(message);
    printMessage(message);
});
//
//document.forms[0].onsubmit = function () {
//    var input = document.getElementById("message");
//    printMessage(input.value);
//    socket.emit("chat", input.value);
//    input.value = '';
//};

function setTitle(title) {
    document.querySelector("h1").innerHTML = title;
}

function printMessage(message) {
    const p = document.createElement("p");
    p.innerText = message;
    const messagesDiv = document.querySelector("div.messages");
    messagesDiv.insertBefore(p, messagesDiv.firstChild);
}

