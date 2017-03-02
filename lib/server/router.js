'use strict';

var EventEmitter = require('events').EventEmitter,
    util = require('../util'),
    urlParser = require('url');

class Router extends EventEmitter {
    constructor(opts) {
        super();

        this.name = opts.name || 'unnamed';
        this.routes = {
            GET: [],
            POST: []
        };
    }

    bind(handler, opts) {
        console.log('bind', arguments);
        let route = {
            handler: handler,
            name: opts.name,
            method: opts.method,
            path: opts.path
        };
        this.routes[opts.method].push(route);
        return route;
    }

    lookup(req, res) {
        let routes = this.routes[req.method];
        let url = urlParser.parse(req.url);
        let found = null;
        for (let i = 0; i < routes.length; i++) {
            try {
                if (routes[i].path === url.pathname) {
                    found = routes[i];
                    break;
                }
            } catch (e) {
                throw new Error('NotFoundRoute' + e);
            }
        }
        return found;
    }
}


module.exports = Router;
