'use strict';

const express = require('express');
const router = express.Router();
const crawler = require('../crawler');
const colors = require('colors');
const config = require('../config');
const PubSub = require('../emitter');

const arr = [];

for (let i = 0; i <= 100; i++) {
    arr.push(Math.random() * i);
}
// crawler();
let data = {};

let cnt = Number(0);

/* GET home page. */
router.get('/', (req, res, next) => {
    console.log("****INSIDE THE INDEX ROUTE***".repeat(20));
    const io = req.app.get('socketio');

    io.on("connection", function(socket) {

        socket.on("chat", function(message) {
            socket.broadcast.emit("message", message);
        });

        PubSub.on('page', (data) => {
            console.log('PAGE INSIDE INDEX ROUTE********************************');
            socket.emit('message', data);
        })
        socket.emit("message", "Welcome to Cyber Chat");

    });

    res.sendfile('./public/new_index.html');
    // res.status(200);
    //if (data.data.length !== oldVal) {

    // res.json({
    //     reqParams: req.query,
    //     data: data
    // });


    // res.end({
    //     resp: "inside the crawl route",
    //     originalUrl: req.originalUrl,
    //     reqParams: req.params,
    //     reqQuery: req.query.url
    // });

});
//
//router.route('/crawl/:url')
//    .get( (req, res) => {
//        console.log("INSIDE THE ROUTE");
//        if (req.params.url) {
//            console.log(req.params.url);
//            res.json(req.params);
//        } else {
//            res.json(req.body);
//        }
//    });



router.get('/crawl', (req, res, next) => {

    // const io = req.app.get('socketio');
    //
    // io.on("connection", function(socket) {
    //
    //     socket.on("chat", function(message) {
    //         socket.broadcast.emit("message", message);
    //     });
    //
    //     PubSub.on('page', (data) => {
    //         console.log('PAGE INSIDE INDEX ROUTE********************************');
    //         socket.emit('message', data);
    //     })
    //
    //     socket.emit("message", "Welcome to Cyber Chat");
    //
    // });

    if (req.query.url) {
        crawler({url: req.query.url});

        PubSub.on('data-received', (data) => {
            res.status(200);
            res.json({
                reqParams: req.query,
                data: data
            });
            PubSub.removeAllListeners('data-received');
        })
    } else {
        res.status(404).end(`Cannot crawl ${req.query.url}, please provide a valid URL`);
    }


})

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
