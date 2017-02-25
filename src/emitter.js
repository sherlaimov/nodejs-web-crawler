'use strict';
const events = require('events');
const emitter = new events.EventEmitter();
const colors = require('colors');

let cnt = 0;
emitter.on('data-received', (e) => {
    cnt++;
    console.log(`Data-received event triggered ${cnt} times`.bgCyan);
});


emitter.on('data-sorted', (data) => {
    console.log(`********* DATA SORTED EVENT`.rainbow);
});
module.exports = emitter;