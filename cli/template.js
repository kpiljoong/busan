'use strict';

var _ = require('lodash');

var matcher = /<%%([^%]+)%>/g;
var detecter = /<%%?[^%]+%>/;

class Template {
    parse(src, data) {
        src = src.replace(matcher, (m, content) => {
            return '(;>%%<;)' + content + '(;>%<;)';
        });

        src = _.template(src)(data);
        src = src
            .replace(/\(;>%%<;\)/g, '<%')
            .replace(/\(;>%<;\)/g, '%>');
        return src;
    }

    detect(body) {
        return detecter.test(body);
    }
}

module.exports = new Template();
