'use strict';

const express = require('express');
const path = require('path');
const colors = require('colors');
const config = require('../../config');
const PubSub = require('../emitter');
const Crawler = require('../crawler');

const crawler = new Crawler();
const router = express.Router();


router.get('/', (req, res) => {
    const io = req.app.get('socketio');
    const connections = [];

    io.on("connection", function (socket) {
        connections.push(socket);
        console.log(`Connected: ${connections.length} sockets connected`);

        crawler.on('live-table', (data) => {
            socket.emit('live-table', data);
        });

        socket.on('disconnect', () => {
            connections.splice(connections.indexOf(socket), 1);
            console.log(`Disconnected: ${connections.length} sockets connected`);
        });
    });
    res.sendFile('new_index.html', { root: path.normalize('./public/') });
});

router.get('/crawl', (req, res, next) => {
    if (req.query.url) {
        crawler.crawl(req.query.url);

        PubSub.on('data-sorted', (data) => {
            let avgSum = data.reduce((a, b) => a + b.avgTime, 0);
            let minSum = data.reduce((a, b) => a + b.minTime, 0);
            let maxSum = data.reduce((a, b) => a + b.maxTime, 0);

            let avgMax = Math.round(maxSum / data.length);
            let avgMin = Math.round(minSum / data.length);
            let avgTime = Math.round(avgSum / data.length);

            res.status(200);
            res.json({
                reqParams: req.query,
                data,
                avgTime,
                avgMin,
                avgMax
            });

            PubSub.removeAllListeners('data-sorted');
        });
    } else {
        res.status(404).end(`Cannot crawl ${req.query.url}, please provide a valid URL`);
    }
});

router.get('/stop', (req, res) => {
    crawler.emit('crawler-stop');
    res.status(200).end('Stop action');
});

let data = {};

router.post('/data', (req, res, next) => {
    console.log(req.body);
    if (req.body.url) {
        data.data = crawler.crawl(req.body.url);
        res.redirect(`${config.url}`)
    } else {
        res.json(req.body);
    }
})

module.exports = router;
