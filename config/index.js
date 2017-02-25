/**
 * Created by ES on 04.02.2017.
 */
"use strict";

const path = require('path');
const port = process.env.PORT || 3000;
const publicDir = path.resolve(process.cwd(), 'public');
const viewsDir = path.resolve(publicDir, 'views');
const layoutDir = path.resolve(viewsDir, 'layouts');

module.exports = {
    port : port,
    url : `http://localhost:${port}`,
    db: 'mongodb://localhost:27017/saggdb',
    publicDir,
    viewsDir,
    layoutDir,
};
