'use strict';

var busan = require('../../../');

exports.init = function() {
    // busan.get('/favicon.ico', busan.faviconSupporter);
    busan.get('/', indexHandler);
}

function indexHandler() {
    this.view('index.html');
}
