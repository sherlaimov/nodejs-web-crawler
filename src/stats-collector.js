'use strict';

const request = require('request');
const PubSub = require('./emitter');
const output = [];

PubSub.on('data-received', (pagesVisited) => {
    for (let i = 0; i < 5; i++) {
        iterate(pagesVisited);
        console.log(`ITERATION NUMBER ${i}`);
    }

    output.length = 0;

    //Bluebird js?
    setTimeout(() => {
        //console.log('************* => OUTPUT <= ****************');
        //console.log(output);

        //array_merge([], [])

        const found = [];
        const sorted = output.map(function(page, i) {
                let newObj = {};
                newObj.time = [];
                newObj.size = [];
                for (let i = 0; i < output.length; i++) {
                    if (page.url === output[i].url) {
                        newObj.url = page.url;
                        newObj.time.push(output[i].time);
                        newObj.size = output[i].size;
                    }
                }
                newObj.maxTime = Math.max.apply(Math, newObj.time);
                newObj.avgTime = Math.round(newObj.time.reduce((a, b) => a+ b) / newObj.time.length);
                newObj.minTime = Math.min.apply(Math, newObj.time);
                return newObj;
            })
             .filter(function(page, i, arr) {
                 for (let i = 0; i < arr.length; i++){
                     // if (page.url == arr[i].url && ! found.includes(arr[i].url)) {
                     if (page.url == arr[i].url && found.indexOf(arr[i].url) == -1) {
                         found.push(page.url);
                         return page;
                     }
                 }

             })
        //.reduce((a, b, i, arr) => {
        //    a.push(b.url);
        //    if (b.url == arr[i].url && a.indexOf(arr[i].url) == -1) {
        //        return b;
        //    }
        //}, [])

        PubSub.emit('data-sorted', sorted);
        //console.log('************** => SORTED <= *********************');
        //console.log(JSON.stringify(sorted, null, 2));
    }, 2500);

})


function iterate(pagesVisited) {

    pagesVisited.forEach((page) => {
        let infoObj = {};
        // console.log(`Collecting stats for page ${page.url}`);
        const d = new Date();
        const before = d.getTime();

        request(page.url, function (error, response, body) {
            if (error) {
                console.log(error);
                console.log(`An error has occurred \n code: ${error.code}`);
                return;
            }
            // console.log("Status code: " + response.statusCode);
            if (response.statusCode !== 200) {
                return;
            }

            if (body) {
                let reqTime = new Date().getTime() - before;
                infoObj.url = page.url;
                infoObj.time = reqTime;
                infoObj.size = body.length;
                output.push(infoObj);

            }
        });

    })

}