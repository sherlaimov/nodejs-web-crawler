/**
 * Created by ES on 02.02.2017.
 */
'use strict';

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const URL = require('url-parse');
const colors = require('colors');
const events = require('events');
const statsCollector = require('./stats-collector');
const PubSub = require('./emitter');

const MAX_PAGES_TO_VISIT = 40;

class Crawler extends events.EventEmitter {
    constructor () {
        super();

        this.pagesToVisit = [];
        this.on('crawler-stop', () => this.stop(this.pagesToVisit));
    }

    crawl(url) {
        return Promise.all([this.visitPage(url)
        .then(info => {
            this.pagesToVisit.push(info.url);

            this.emit('live-table', info);

            const $ = cheerio.load(info.body);
            const baseUrl = new URL(url).origin;

            const promises = this.getInternalLinks(baseUrl, $)
                    .map((url) => new URL(url))
                    .filter((urlObj) => baseUrl === urlObj.origin)
                    .map((urlObj) => `${baseUrl}${urlObj.pathname}`)
                    .filter((url) => url && !this.pagesToVisit.includes(url) &&
                                     this.pagesToVisit.length < MAX_PAGES_TO_VISIT &&
                                     this.pagesToVisit.push(url))
                    .map((url) => this.visitPage(url || baseUrl)
                    .then((info) => {
                        this.emit('live-table', info);
                    }));

            return Promise.all(promises);
        })])
        .then(() => this.stop(this.pagesToVisit))
        .catch((error) => {
            console.log(error);
            console.log(`An error has occurred \n code: ${error.code}`);
        });
    }

    visitPage(url) {
        const start = new Date().getTime();
        console.log(`Visiting page ${url}`);

        return fetch(url)
        .then(resp => {
            console.log("Status code: " + resp.status);
            return resp.text();
        })
        .then(body => {
            let reqTime = new Date().getTime() - start;

            console.log(`Bytes loaded ${body.length}`.bgYellow);
            console.log('REQUEST TIME'.bgRed);
            console.log(start);
            console.log(reqTime.toString().bgGreen);

            return {
                url,
                time: reqTime,
                body,
                size: body.length,
            };
        })
        .catch(err => {
            console.log(error);
            console.log("Status code: " + resp.status);
            console.log(`An error has occurred \n code: ${error.code}`);
        });
    }

    getInternalLinks(baseUrl, $) {
        let relativeLinks = 0;
        const absoluteBase = new RegExp('^' + baseUrl);
        const relative = new RegExp('^\/');

        const links = $("a")
            .map((i, el) =>
                $(el).attr('href'))
            .filter((i, href) =>
                href && href.search(/javascript:void\(0\)/) === -1 &&
                (absoluteBase.test(href) || relative.test(href)))
            .map((i, href) => {
                relativeLinks++;
                return relative.test(href) ? baseUrl + href : href;
            }).toArray();

        console.log(`Found ${relativeLinks} relative links on page ${baseUrl}`.bgCyan);

        return links;
    }

    stop() {
        console.log('All pages have been crawled'.bgGreen);
        console.log('Pages visited'.bgGreen);
        console.log(`Total of visited pages ${this.pagesToVisit.length}`.bgCyan);
        console.log('Starting stats collection...');

        PubSub.emit('data-received', this.pagesToVisit);
        this.pagesToVisit = [];
    }
}

module.exports = Crawler;
