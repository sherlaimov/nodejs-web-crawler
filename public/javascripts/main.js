/**
 * Created by ES on 04.02.2017.
 */

;(function ($, Handlebars, d3) {


    var Twitch = {
        init: function (elem, options) {
            const self = this;
            self.options = options || {};
            self.url = 'http://localhost:3000/';
            self.options.ajax = {
                url: self.url + 'crawl/',
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
            self.$modal = $('#statsModal');
            self.$form = $('#urlForm');
            self.$stopBtn = $('#stopCrawling');
            self.$form.on("submit", (e) => {
                e.preventDefault();
                let url = document.querySelector('#urlInput').value;
                if (self.validateURL(url)) {
                    self.fetch({
                            data: self.$form.serialize()
                        })
                        .done(data => self.render(data))
                        .fail((e) => {
                            console.log(e);
                            console.log('Query failed');
                        })
                    self.$modal.modal({keyboard: false});
                } else {
                    const alert = document.querySelector('.alert');
                    alert.innerHTML = `<strong>${url}</strong> is not a valid URL. Please, enter a valid one which starts with either "http://" or "www."`;
                    alert.style.display = 'block';
                    setTimeout(() => {
                        alert.style.display = 'none';
                    }, 2500);
                }


            });
            self.$modal.on('hidden.bs.modal', (e) => {
                self.$modal.find('#realTimeTable tbody').html("");
                document.querySelector('#aveResTime').innerHTML = '';
                document.querySelector('#pagesCrawled').innerHTML = '';

            });

            self.$stopBtn.on('click', (e) => {
                self.fetch({url: self.url + 'stop/'});
            })

        },

        render: function (data) {
            console.log(data);
            const self = this;
            if ("data" in data) {
                self.$elem.html('').append(self.template(data));
                createChart(data);
            }
            if (data.avgTime) {
                // let end = data.avgMax - data.avgMin;
                // let newAvg = data.avgTime - data.avgMin;
                // let val = ( newAvg / end ) * 100;
                let newAvg = Math.round(((data.avgTime - data.avgMin) / (data.avgMax - data.avgMin)) * 100);
                console.log(newAvg);
                const progressBar = document.querySelector('.progress-bar');
                progressBar.style.width = `${newAvg}%`;
                progressBar.innerHTML = `Average page speed ${data.avgTime} ms`;
                //const span = document.createElement('span');

            }


        },

        fetch: function (options) {
            const self = this;
            let opts = $.extend({}, self.options.ajax, options);
            return $.ajax(opts);
        },
        validateURL: function (textval) {
            var urlregex = new RegExp(
                "^(http:\/\/www.|https:\/\/www.|ftp:\/\/www.|www.|http:\/\/|https:\/\/){1}([0-9A-Za-z]+\.)");
            return urlregex.test(textval);
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

    Handlebars.registerHelper("makeLink", (text, url) => {
        text = Handlebars.Utils.escapeExpression(text);
        url = Handlebars.Utils.escapeExpression(url);
        let link = `<a href="${text}">${url}</a>`;
        return new Handlebars.SafeString(link);
    })

    Handlebars.registerHelper("counter", function (value, options) {
        return parseInt(value) + 1;
    });


    //https://bl.ocks.org/d3noob/bdf28027e0ce70bd132edc64f1dd7ea4

    function createChart({data:data, avgMax: avgMax, avgMin:avgMin, avgTime: avgTime}) {

        // set the dimensions and margins of the graph
        var margin = {top: 20, right: 20, bottom: 30, left: 60},
            width = 970 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        //const colors = d3.scaleOrdinal(d3.schemeCategory10);
        const colors = d3.scaleLinear()
            .domain([avgMin, avgMax])
            .range(['#f4eb42', '#f44141']);
// set the ranges
        var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
        var y = d3.scaleLinear()
            .range([height, 0]);

// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
        var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// get the data

        //console.log(data);
        // Scale the range of the data in the domains
        //x.domain(data.map(function(d) { return d.salesperson; }));
        x.domain(d3.range(0, data.length));
        y.domain([avgMin, avgMax]);

        // append the rectangles for the bar chart
        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .style('fill', (d, i) => colors(d.avgTime))
            .attr("x", function (d, i) {
                return x(i);
            })
            .attr("width", x.bandwidth())
            .attr("y", height)
            .attr("height", 0)
            //.attr('height', function (d) {
            //    return height - y(d.avgTime);
            //})
            //.attr('y', (d) => y(d.avgTime))

        svg.selectAll('.bar').transition()
            .attr('height', function (d) {
                return height - y(d.avgTime);
            })
            .attr('y', (d) => y(d.avgTime))
            .delay((d, i) => i * 20)
            .duration(1000);

        let tempColor;
        const tooltip = d3.select('body').append('div')
            .style('position', 'absolute')
            .style('padding', '0 10px')
            .style('background', '#fff')
            .style('opacity', 0);
        svg.selectAll('.bar')
            .on("mouseover", function (d, i, e) {
                //console.dir(this);
                tooltip.transition()
                    .style('opacity', .9);

                tooltip.html('<h4>' + data[i].url + '</h4>' + d.avgTime + ' ms')
                    .style('left', (d3.event.pageX - 20) + 'px')
                    .style('top', (d3.event.pageY - 60) + 'px');

                //console.log(this.$el.find('rect'));
                tempColor = this.style.fill;
                d3.select(this)
                    .transition()
                    .style('opacity', .5)
                    .style('fill', '#fbf606')
            })
            .on('mouseout', function (d) {
                tooltip.html('')
                d3.select(this)
                    .transition().duration(250)
                    .style('opacity', 1)
                    .style('fill', tempColor)
            });

        // add the x Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // add the y Axis
        svg.append("g")
            .call(d3.axisLeft(y));

        // text label for the y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Average Response Time in Milliseconds");


    }

})(jQuery, Handlebars, d3);

