'use strict';

var busan = require('../../');

var opts = {
    debug: true,
    port: 9000,
    host: '0.0.0.0'
};

busan.run(opts);
console.log(`Server is running at ${opts.port}`);
