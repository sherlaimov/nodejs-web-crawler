/**
 * Created by ES on 09.02.2017.
 */

const socket = io("http://localhost:3000");

socket.on("disconnect", function () {
     const status = document.querySelector('.socket-status');
    status.firstChild.innerHTML = 'Socket IO disconnected';
    status.style.color = 'red';
    //socket.close();
});

socket.on("connect", function () {
    const status = document.querySelector('.socket-status');
    status.firstChild.innerHTML = 'Socket IO connected';
    status.style.color = '#64d64d';
});

socket.on("message", function (message) {
    // console.log(message);
    // printMessage(message);
});




function setTitle(title) {
    document.querySelector("h1").innerHTML = title;
}

function printMessage(message) {
    const p = document.createElement("p");
    p.innerText = message;
    const messagesDiv = document.querySelector("div.messages");
    messagesDiv.insertBefore(p, messagesDiv.firstChild);
}



function printTable(data) {
    const tr = document.createElement('tr');
    const html = `<td>${data.url}</td><td>${data.time}</td><td>${data.size}</td>`;
    tr.innerHTML = html;
    const tbody = document.querySelector('#realTimeTable tbody');
    tbody.insertBefore(tr, tbody.firstChild);
    // console.log(data);

}


socket.on("live-table", function (data) {
    averageLoadTime(data.time);
    //console.log(data);
    printTable(data);

});


//const h3 = document.querySelector('h3');
const aveResTime = document.querySelector('#aveResTime');
const pagesCrawled = document.querySelector('#pagesCrawled');
//mHeader.appendChild(h3);
//span.inner
let arr = [];

let avg = 0;
function averageLoadTime(time) {
    arr.push(time);

    if (arr.length != 0) {
        let sum = 0;
        for( let i = 0; i < arr.length; i++ ){
            sum += parseInt( arr[i]);
        }

        avg = sum / arr.length;
        aveResTime.innerHTML = Math.round(avg);
        pagesCrawled.innerHTML = arr.length;
        //console.log(`Response time sum ${sum}`);
        //console.log(`Array length ${arr.length}`);
        ////
        //console.log('AVERAGE');
        //console.log(avg);
    }

}

socket.once('live-table', function(data){
    //console.log('************ Got event ONCE');
    //console.log(arr.length != 0);


});




