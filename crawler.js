/**
 * Created by ES on 02.02.2017.
 */
'use strict';

const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');
const colors = require('colors');
const fs = require('fs');

//CHANGE THE URL
// var START_URL = "http://www.arstechnica.com";
//  var START_URL = "http://kayako-development.com";
//  var START_URL = "http://gram.com.ua";
let START_URL = "http://www.mrcplast.com/";
const MAX_PAGES_TO_VISIT = 2;

const pagesVisited = [];
let numPagesVisited = 0;
const pagesToVisit = [];
let url = new URL(START_URL);
let baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(baseUrl);
// crawl();

const output = [];
function collectStats(pagesVisited) {
 for (let i = 0; i < 5; i++) {
     iterate();
 }
    function iterate(){
        let infoObj = {};
        let pageStats = {};
        pagesVisited.map((page) => {
            console.log(`Collecting stats for page ${page.url}`);
            const d = new Date();
            const before = d.getTime();

            let url = page.url;

            infoObj[url] = [];

            request(page.url, function (error, response, body) {
                // Check status code (200 is HTTP OK)
                //fs.writeFile(`response.txt`, JSON.stringify(response));
                if (error) {
                    console.log(error);
                    console.log(`An error has occurred \n code: ${error.code}`);
                    return;
                }

                console.log("Status code: " + response.statusCode);

                if (response.statusCode !== 200) {
                    return;
                }


                if (body) {
                    //console.log(`Bytes loaded ${body.length}`.bgYellow);
                    //return;
                    let reqTime = new Date().getTime() - before;
                    infoObj[url].push({time: reqTime, size: body.length});
                    //pageStats.time = reqTime;
                    //pageStats.size = body.length;
                    //infoObj[url].size = body.length;
                    //console.log('REQUEST TIME'.bgRed);

                }
            });
        })

        if (infoObj[url] !== undefined) {
            //infoObj[url].push(pageStats);
            //console.log("SHOULD WORK TWICE");
            //console.log(infoObj);
        }
        //console.log(url in infoObj);
        output.push(infoObj);
        //console.log(before);
        //console.log(reqTime.toString().bgGreen);
        console.log('************** => OUTPUT <= *********************');

        setTimeout(() => {
            console.log(JSON.stringify(output, null, 2));
        }, 3500);
    }



}

function crawl(options) {
    let opts = options || {};

    if (opts.stop) {
        return;
    }

    if (opts.url) {
        console.log("INSIDE opts.url in CRAWLER");
        //console.log(opts.url);
        START_URL = opts.url;
        url = new URL(START_URL);
        baseUrl = url.protocol + '//' + url.hostname;
        pagesToVisit.length = 0;
        pagesVisited.length = 0;
        numPagesVisited = 0;
        pagesToVisit.push(baseUrl);
        console.log(pagesToVisit);
    }

    if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
        console.log('Pages visited'.bgGreen);
        console.log(pagesVisited);
        console.log("Reached max limit of number of pages to visit.");
        console.log(`Total of visited pages ${pagesVisited.length}`);
        console.log('Starting stats collection...');
        collectStats(pagesVisited);

        return;
    }


    var nextPage = pagesToVisit.pop();

    if (pagesVisited.find(page => nextPage === page.url) !== undefined) {
        // We've already visited this page, so repeat the crawl
        crawl();

    } else if (nextPage != undefined) {
        // New page we haven't visited
        console.log('Next page'.bgMagenta);
        console.log(nextPage);
        visitPage(nextPage, crawl);
    } else {
        console.log('All pages have been crawled'.bgGreen);
        console.log('Pages visited'.bgGreen);
        console.log(pagesVisited);
        console.log(`Total of visited pages ${Object.keys(pagesVisited).length}`);
        return;
    }

    if (pagesVisited) {
        return pagesVisited;
    }
}

function visitPage(url, callback) {
    // Add page to our set
    // pagesVisited[url] = {
    //     time: null,
    //     size: null
    //
    // };
    let infoObj = {
        url: url,
        time: null,
        size: null
    };
    numPagesVisited++;
    console.log(`Total pages visited ${numPagesVisited}`.bgCyan);

    const d = new Date();
    const before = d.getTime();
    // Make the request
    console.log(`Visiting page ${url}`);
    request(url, function (error, response, body) {
        // Check status code (200 is HTTP OK)
        //fs.writeFile(`response.txt`, JSON.stringify(response));
        if (error) {
            console.log(error);
            console.log(`An error has occurred \n code: ${error.code}`);
            return;
        }

        console.log("Status code: " + response.statusCode);

        if (response.statusCode !== 200) {
            callback();
            return;
        }

        if (body) {
            console.log(`Bytes loaded ${body.length}`.bgYellow);
            //return;
            let reqTime = new Date().getTime() - before;
            infoObj.time = reqTime;
            //**************QUESTION*********************
            let count = encodeURIComponent(body).length;
            infoObj.size = body.length;
            console.log('REQUEST TIME'.bgRed);
            console.log(before);
            console.log(reqTime.toString().bgGreen);
            pagesVisited.push(infoObj);
        }


        // Parse the document body
        var $ = cheerio.load(body);
        // var isWordFound = searchForWord($, SEARCH_WORD);
        // if(isWordFound) {
        //     console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
        // } else {
        collectInternalLinks($);
        // In this short program, our callback is just calling crawl()
        callback();

    });
}

function collectInternalLinks($) {
    // var relativeLinks = $("a[href^='/']");
    const allLinks = $("a");
    const relativeLinks = [];
    const absoluteBase = new RegExp('^' + baseUrl);
    const relative = new RegExp('^\/');
    const protocol = new RegExp(url.protocol, 'gi');
    // console.log(match);
    allLinks.each(function () {
        // console.log($(this).attr('href'));
        if ($(this).attr('href')) {
            if ($(this).attr('href').search(/javascript:void\(0\)/) != -1) {
                //console.log($(this).attr('href'));
                return;
            }

            // if($(this).attr('href').match(protocol) !== null) {
            //     // console.log($(this).attr('href').match(protocol).length);
            // }

            if (absoluteBase.test($(this).attr('href'))) {
                // console.log($(this).attr('href'));
                relativeLinks.push($(this).attr('href'));
                pagesToVisit.push($(this).attr('href'));
            }

            if (relative.test($(this).attr('href'))) {
                // console.log( $(this).attr('href'));
                relativeLinks.push(baseUrl + $(this).attr('href'));
                pagesToVisit.push(baseUrl + $(this).attr('href'));
            }

        }


    });

    console.log(`Found ${relativeLinks.length} relative links on page`.bgCyan);

}

function searchForWord($, word) {
    var bodyText = $('html > body').text().toLowerCase();
    return (bodyText.indexOf(word.toLowerCase()) !== -1);
}

module.exports = crawl;