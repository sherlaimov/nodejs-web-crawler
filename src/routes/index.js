'use strict';

const express = require('express');
const path = require('path');
const router = express.Router();
const crawler = require('../crawler');
const colors = require('colors');
const config = require('../../config');
const PubSub = require('../emitter');


let data = {};


/* GET home page. */
router.get('/', (req, res) => {

    // console.log("****INSIDE THE INDEX ROUTE***".repeat(20));
    const io = req.app.get('socketio');
    const connections = [];

    io.on("connection", function(socket) {
        connections.push(socket);
        console.log(`Connected: ${connections.length} sockets connected`);

        // socket.on("chat", function(message) {
        //     socket.broadcast.emit("message", message);
        // });


        PubSub.on('live-table', (data) => {
            socket.emit('live-table', data);
        })

        //socket.emit("message", "Welcome to Cyber Chat");

        socket.on('disconnect', (data) => {
            connections.splice(connections.indexOf(socket), 1);
            console.log(`Disconnected: ${connections.length} sockets connected`);
        });

    });

    res.sendFile('new_index.html', {root: path.normalize('./public/')});

});




router.get('/crawl', (req, res, next) => {

    if (req.query.url) {
        crawler({url: req.query.url, stop: false});

        PubSub.on('data-sorted', (data) => {
            let avgSum = data.reduce((a, b) => { return a + b.avgTime }, 0);
            let minSum = data.reduce((a, b) => { return a + b.minTime }, 0);
            let maxSum = data.reduce((a, b) => { return a + b.maxTime }, 0);
            let avgMax = Math.round( maxSum / data.length );
            let avgMin = Math.round( minSum / data.length );
            let avgTime = Math.round( avgSum / data.length);
            res.status(200);
            res.json({
                reqParams: req.query,
                data: data,
                avgTime: avgTime,
                avgMin: avgMin,
                avgMax: avgMax
            });
            PubSub.removeAllListeners('data-sorted');
        })
    } else {
        res.status(404).end(`Cannot crawl ${req.query.url}, please provide a valid URL`);
    }


});
router.get('/stop', (req, res) => {
        crawler({stop: true});
        res.status(200).end('Stop action');


});


router.post('/data', (req, res, next) => {
    //console.log(req);
    console.log(req.body);
    if (req.body.url) {
        data.data = crawler({url: req.body.url});
        res.redirect(`${config.url}`)
    } else {
        res.json(req.body);
    }

})

module.exports = router;
