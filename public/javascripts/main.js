/**
 * Created by ES on 04.02.2017.
 */

;(function ($, Handlebars) {


    var Twitch = {
        init: function (elem, options) {
            const self = this;
            self.options = options || {};
            self.url = 'http://localhost:3000/';
            self.options.ajax = {
                url: self.url + 'data/',
                type: "GET",
                //data: {
                //    type: 'suggest',
                //    query: this.options.search
                //},
                dataType: 'json',
                contentType: "application/json: charset=utf-8"
            };
            self.elem = elem;
            self.$elem = $(elem);
            self.template = Handlebars.compile($('#table-template').html());

            self.form = $('#urlForm');
            self.form.on("submit", (e) => {
                e.preventDefault();
                //console.log(self.form.serialize());
                self.fetch({
                    url: self.url + 'crawl/',
                    data: self.form.serialize()
                })
                    .done(data => self.render(data))
                    .fail((e) => {
                        console.log(e);
                        console.log('Query failed');
                    })

            });
            // if( typeof options === 'string') {
            // 	self.search = options;
            // } else {
            // 	self.search = options.search;
            // }
            //self.search = (typeof options ==='string')
            //    ? options
            //    : options.search;
            //self.options = $.extend({}, $.fn.queryTwitch.options, options);

            //self.refresh(250);
            self.fetch()
                .done(data => self.render(data))
                .fail((e) => {
                    console.log(e);
                    console.log('Query failed');
                })
            //self.render();
        },

        testRender: function () {
            const self = this;
            self.$elem.append(self.template({data: [{name: "Abishek"}, {name: "Eugene"}]}));
        },

        render: function (data) {
            console.log(data);
            const self = this;
            if ("data" in data) {
                self.$elem.html('').append(self.template(data.data));
            }

        },

        fetch: function (options) {
            const self = this;
            let opts = $.extend({}, self.options.ajax, options);
            return $.ajax(opts);
        },

        renderTable: function (elem, data) {
            const self = this;
            //console.log(data);
            const table = $(document.createElement('table')).addClass('table table-striped');

            const thead = $(document.createElement('thead'));
            thead.append($('<th>').text('#'));
            const tbody = $(document.createElement('tbody'));

            $.each(data, (rowIndex, r) => {
                if (rowIndex === 0) {
                    Object.keys(r).forEach((key, i) => {
                        let th = $("<th/>");
                        th.text(key);
                        thead.append(th);
                    })
                }
                let row = $("<tr/>");

                row.append($("<td>").text(++rowIndex));
                $.each(r, function (colIndex, c) {
                    row.append($("<td>").text(c));
                    tbody.append(row);
                });
            });
            table.append(thead);
            table.append(tbody);
            //console.log(elem);
            return elem.append(table);

        }
    };

    const table = document.querySelector('#table');


    Twitch.init(table, {});

    $.fn.queryTwitch = function (options) {

        return this.each(function () {
            var twitch = Object.create(Twitch);
            twitch.init(options, this);
        });
    };

    $.fn.queryTwitch.options = {
        search: 'gta',
        wrapEachWith: '<li></li>',
        limit: 10,
        refresh: null,
        onComplete: null,
        transition: 'fadeToggle'
    };

    Handlebars.registerHelper("makeLink", (text, url) => {
        text = Handlebars.Utils.escapeExpression(text);
        url = Handlebars.Utils.escapeExpression(url);
        let link = `<a href="${text}">${url}</a>`;
        return new Handlebars.SafeString(link);
    })

})(jQuery, Handlebars);


;(function ($, Handlebars) {
    'use strict';

    var namespace = window,
        pluginName = 'TemplateEngine';

    var TemplateEngine = function TemplateEngine(options) {
        if (!(this instanceof TemplateEngine)) {
            return new TemplateEngine(options);
        }

        this.settings = $.extend({}, TemplateEngine.Defaults, options);
        this._storage = {};

        return this;
    };
    TemplateEngine.Defaults = {
        templateDir: './tpl/',
        templateExt: '.tpl'
    };

    TemplateEngine.prototype = {
        constructor: TemplateEngine,

        load: function (name, $deferred) {
            var self = this;
            $deferred = $deferred || $.Deferred();

            if (self.isCached(name)) {
                $deferred.resolve(self._storage[name]);
            } else {
                $.ajax(self.urlFor(name)).done(function (raw) {
                    self.store(name, raw);
                    self.load(name, $deferred);
                });
            }

            return $deferred.promise();
        },
        fetch: function (name) {
            var self = this;

            $.ajax(self.urlFor(name)).done(function (raw) {
                self.store(name, raw);
            });
        },
        isCached: function (name) {
            return !!this._storage[name];
        },
        store: function (name, raw) {
            this._storage[name] = Handlebars.compile(raw);
        },
        urlFor: function (name) {
            return (this.settings.templateDir + name + this.settings.templateExt);
        }
    };


    window[pluginName] = TemplateEngine;

})(jQuery, Handlebars);

(function () {
    var Twitter = {
        init: function (config) {
            this.url = 'http://weareukraine/tweets/gettweets/?count=6&screen_name=weareukraine&callback=?';
            this.template = config.template;
            //console.log(this.template);
            //return true;
            this.container = config.container;
            this.fetch();
            //console.log(this.tweets);
        },
        attachTemplate: function () {
            var template = Handlebars.compile(this.template);
            this.container.append(template(this.tweets));
            //console.log(html);
        },
        fetch: function () {
            var self = this;
            $.getJSON(this.url, function (data) {
                console.log(this);
                self.tweets = $.map(data, function (tweet) {
                    return {
                        author: tweet.user.name,
                        userScreenName: tweet.user.screen_name,
                        thumb: tweet.user.profile_image_url,
                        date: tweet.created_at,
                        text: tweet.text,
                        retweetCount: tweet.retweet_count,
                        url: 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str,
                        userLocation: tweet.user.location,
                        // image: data[0].extended_entities.media[0].media_url
                        // image: tweet.extended_entities.media[0].media_url
                        // tweet.extended_entities.media_url_https
                    };
                });
                self.attachTemplate();
                console.log(data[0].extended_entities.media[0].media_url);
            });
        }
    };
    //Twitter.init({
    //    template: $('#tweets-template').html(),
    //    container: $('ul.tweets')
    //});
})(jQuery);