/**
 * Created by ES on 02.02.2017.
 */
'use strict';

const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');
const colors = require('colors');
const fs = require('fs');
const PubSub = require('./emitter');
const statsCollector = require('./stats-collector');

// var START_URL = "http://www.arstechnica.com";
let START_URL = "www.kayako-development.com";
//  var START_URL = "http://gram.com.ua";
// let START_URL = "http://www.mrcplast.com/";
const MAX_PAGES_TO_VISIT = 25;

const pagesVisited = [];
let numPagesVisited = 0;
const pagesToVisit = [];
let url = new URL(START_URL);
let baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(baseUrl);


let opts = {stop: false};
function crawl(options) {
    opts = Object.assign(opts, options);
    console.log('********************* OPTIONS OBJECT ***************');
    console.log(opts);

    if (opts.stop) {
        PubSub.emit('data-received', pagesVisited);
        pagesToVisit.length = 0;
        return;
    }

    if (opts.url) {
        START_URL = opts.url;
        url = new URL(START_URL);
        if (url.hostname === ''){
            let newUrl = '';
            if (url.href.indexOf('www.') != -1) {
                newUrl = url.href.replace('www.', '');
            }
            baseUrl = `http://${newUrl}`;
        } else {
            baseUrl = url.protocol + '//' + url.hostname;
        }
        pagesToVisit.length = 0;
        pagesVisited.length = 0;
        numPagesVisited = 0;
        pagesToVisit.push(baseUrl);
        delete opts.url;
    }

    if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
        console.log('Pages visited'.bgGreen);
        console.log("Reached max limit of number of pages to visit.");
        console.log(`Total of visited pages ${pagesVisited.length}`);
        console.log('Starting stats collection...');
        PubSub.emit('data-received', pagesVisited);
        //collectStats(pagesVisited);
        return;
    }


    let nextPage = pagesToVisit.pop();

    if (pagesVisited.find(page => nextPage === page.url) !== undefined) {
        // We've already visited this page, so repeat the crawl
        crawl();

    } else if (nextPage != undefined && opts.stop !== true) {
        // New page we haven't visited
        console.log('Next page'.bgMagenta);
        console.log(nextPage);
        visitPage(nextPage, crawl);
    } else {
        console.log('All pages have been crawled'.bgGreen);
        console.log('Pages visited'.bgGreen);
        console.log(pagesVisited);
        console.log(`Total of visited pages ${pagesVisited.length}`);
        return;
    }

    if (pagesVisited.length !== 0) {
        return pagesVisited;
    }
}

function visitPage(url, callback) {
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
            PubSub.emit('live-table', infoObj);
            pagesVisited.push(infoObj);
        }

        // Parse the document body
        var $ = cheerio.load(body);
        collectInternalLinks($);
        callback();

    });
}

function collectInternalLinks($) {
    // var relativeLinks = $("a[href^='/']");
    const allLinks = $("a");
    const relativeLinks = [];
    const absoluteBase = new RegExp('^' + baseUrl);
    const relative = new RegExp('^\/');
    allLinks.each(function () {
        if ($(this).attr('href')) {
            if ($(this).attr('href').search(/javascript:void\(0\)/) != -1) {
                return;
            }

            if (absoluteBase.test($(this).attr('href'))) {
                relativeLinks.push($(this).attr('href'));
                pagesToVisit.push($(this).attr('href'));
            }

            if (relative.test($(this).attr('href'))) {
                relativeLinks.push(baseUrl + $(this).attr('href'));
                pagesToVisit.push(baseUrl + $(this).attr('href'));
            }

        }


    });


    console.log(`Found ${relativeLinks.length} relative links on page`.bgCyan);
}

module.exports = crawl;