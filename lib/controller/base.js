'use strict';

var busan = require('../');

exports.init = function init() {
    busan.get('/favicon.ico', faviconSupporter);
};

function faviconSupporter() {
    let self = this;
    self.view('../public/favicon.ico');
}
