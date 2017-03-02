'use nodent';
'use strict';

var busan = require('../');
    app = {};

app.configure = function configure(conf, next) {
    next();
};

app.requestStart = function requestStart(server) {
};

busan.extend(app).listen(function(err) {
    if (err) {
        console.error(err);
    }
});

module.exports = app;
