'use strict';

const express = require('express');
const router = express.Router();
const crawler = require('../crawler');
const colors = require('colors');
const config = require('../config');


const arr = [];

for (let i = 0; i <= 100; i++) {
    arr.push(Math.random() * i);
}

let obj = crawler();

const data = {
    data: obj
};

let oldVal;

/* GET home page. */
router.get('/data', (req, res, next) => {

    //if (data.data.length !== oldVal) {
    res.json(data);
    res.end();
    // res.render('index', data);
    //oldVal = data.data.length;
    //} else {
    //    res.end(data);
    // res.render('index', data);
    //}
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
    console.log("INSIDE THE ROUTE");
    if(req.query.url){
        data.data = crawler({url: req.query.url});
        setTimeout(() => {
            console.log(data);
            res.json({
                reqParams:req.query,
                data: data.data
            });
        }, 1500)

    } else {
        res.json({
            resp: "inside the crawl route",
            originalUrl: req.originalUrl,
            reqParams: req.params,
            reqQuery: req.query.url
        });
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
