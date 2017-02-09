'use strict';
const events = require('events');
const emitter = new events.EventEmitter();
const colors = require('colors');

let cnt = 0;
emitter.on('data-received', (e) => {
    cnt++;
    console.log(`Data-received event triggered ${cnt} times`.bgCyan);
});


emitter.on('page', (url) => {
    console.log(`page event ${url}`.rainbow);
});
module.exports = emitter;