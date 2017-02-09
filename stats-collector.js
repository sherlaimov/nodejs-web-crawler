'use strict';

const request = require('request');
const PubSub = require('./emitter');
const output = [];

PubSub.on('blah', () => {
    console.log('blah'.repeat(15));
})

PubSub.on('data-received', (pagesVisited) => {
    for (let i = 0; i < 5; i++) {
        iterate(pagesVisited);
        console.log(`ITERATION NUMBER ${i}`);
    }

    output.length = 0;

    setTimeout(() => {
        //const sorted = output.reduce((targetObj, currObj, index, array) => {
        //
        //}, {});

        const found = [];
        const sorted = output.map(function(page, i) {
                let newObj = {};
                newObj.time = [];
                newObj.size = [];
                for (let i = 0; i < output.length; i++) {
                    if (page.url === output[i].url) {
                        newObj.url = page.url;
                        newObj.time.push(output[i].time);
                        newObj.size.push(output[i].size);
                    }
                }
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

        //console.log('************** => OUTPUT <= *********************');
        //console.log(JSON.stringify(sorted, null, 2));
    }, 3500);

})


function iterate(pagesVisited) {
    let pageStats = {};

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
                // console.log(page.url.toString().toUpperCase());
                let reqTime = new Date().getTime() - before;
                // infoObj[url].push({time: reqTime, size: body.length});
                infoObj.url = page.url;
                infoObj.time = reqTime;
                infoObj.size = body.length;
                //PRINT THIS FOR DMITRY - It is already an object with 2 keys
                // console.log(infoObj);
                output.push(infoObj);

                // pageStats.time = reqTime;
                // pageStats.size = body.length;
                //infoObj[url].size = body.length;
                //console.log('REQUEST TIME'.bgRed);

            }
        });

    })

}