/**
 * Created by ES on 04.02.2017.
 */
"use strict";
const port = process.env.PORT || 3000;
const url = `http://localhost:${port}`;

module.exports = {
    url : url,
    port : port,
    db: 'mongodb://localhost:27017/saggdb'
};
