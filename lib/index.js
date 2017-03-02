'use nodent';
'use strict';

var events = require('events'),
    fs = require('fs'),
    http = require('http'),
    Mediator = require('./server/mediator'),
    View = require('./view'),
    path = require('path');

var rootDirectory = process.cwd();

function i() {
    console.log(arguments);
}

function getPath() {
    function join(args) {
        if (args[1] === null) {
            return path.join(rootDirectory, args[0]);
        } else {
            return path.join(rootDirectory, args[0], args[1]);
        }
    }
    let args = Array.prototype.slice.call(arguments);
    if (args.length < 2) {
        args.push(null);
    }

    let dirs = ['module', 'controllers', 'models', 'middleware', 'config'];
    if (dirs.indexOf(args[0]) != -1) {
        return join(args);
    }

    return null;
}

function newRouter() {
    let Router = require('./server/router');
    let opts = {
        name: 'busan'
    };
    return new Router(opts);
}

class Busan extends events.EventEmitter {
    constructor() {
        super();

        this.controllers = {};
        this.models = {};
        this.router = newRouter();
        this.middlewares = [];
    }

    async run(opts) {
        this.install();

        this.server = http.createServer();
        this.server.listen(opts.port, opts.host);
        this.server.on('request', (req, res) => {
            this.handle(req, res);
        });
    }

    async handle(req, res) {
        let route = await this.route(req, res);
        if (route === null) {
            this.serve(req, res, null);
            return;
        }
        this.serve(req, res, route);
        this.emit('postAction', req, res, route);
    }

    serve(req, res, route) {
        let url = req.url;
        // console.log(`URL: ${url}`);
        let splitedUrl = url.split('.');
        let ext = splitedUrl[splitedUrl.length - 1];
        const staticFileExts = ['html', 'htm', 'css', 'js'];
        if (staticFileExts.indexOf(ext) != -1) {
            let filename = './public' + req.url;
            if (fs.existsSync(filename)) {
                let type = 'text/html';
                if (ext === 'js') type = 'application/javascript';
                else if (ext === 'css') type = 'text/css';

                let content = fs.readFileSync(filename).toString('utf8');
                res.setHeader('Content-Type', type);
                res.writeHead(200);
                res.end(content, 'utf-8');
                return;
            }
            res.writeHead(404);
            res.end('null', 'utf-8');
            return;
        }

        try {
            new Mediator(this, req, res, route, this.middlewares).end();
        } catch (err) {
            console.error(`Error while serving url: ${url}`);
            console.error(`Stack: ${err.stack}`);
            res.writeHead(500);
            res.end(err.message);
        }
    }

    async route(req, res) {
        if (req.method === 'POST') {
            req.body = null;
            let body = await util.BodyParser(req);
            req.body = body;
        }
        return this.lookup(req, res);
    }

    lookup(req, res) {
        return this.router.lookup(req, res);
    }

    addController(name) {
        if (this.controllers[name]) return null;

        let ctrl = require(getPath('controllers', name + '.js'));
        this.controllers[name] = ctrl;
        if (ctrl.init) {
            ctrl.init.call(this, this, name);
        }
        return this;
    }

    addMiddleware(name) {
        if (this.middlewares[name]) return null;

        let mw = require(getPath('middlewares', name + '.js'));
        let item = { name: name, obj: mw };
        this.middlewares.push(item);
        if (mw.init) {
            mw.init.call(this, this, name);
        }
        return this;
    }

    install() {
        function load(type, cb) {
            let dir = getPath(type);
            if (fs.existsSync(dir)) {
                fs.readdirSync(dir).forEach(cb);
            }
        }
        // Config
        console.log('Installing Config');
        load('config', (file) => {
            let ext = path.extname(file);
            if (ext.toLowerCase() !== '.json') return;
            this.addController(file.substring(0, file.length - 5));
        });
        // Controllers
        console.log('Installing Controllers');
        load('controllers', (file) => {
            let ext = path.extname(file);
            if (ext.toLowerCase() !== '.js') return;
            this.addController(file.substring(0, file.length - 3));
        });
        // Middlewares
        console.log('Installing Middlewares');
        load('middlewares', (file) => {
            let ext = path.extname(file);
            if (ext.toLowerCase() !== '.js') return;
            this.addMiddleware(file.substring(0, file.length - 3));
        });
    }

    get(opts, handler) {
        if (typeof(opts) === 'string') {
            opts = {
                path: opts
            };
        }

        opts.method = 'GET';
        let route = this.router.bind(handler, opts);
        if (route === null) {
            return false;
        }
        return true;
    }

    view(ctrl, name) {
        let view = new View(ctrl, name).render();
        return view;
    }

    response(req, res, code, type, content) {
        if (type === null) type = 'application/json';
        res.setHeader('Content-Type', type);
        res.writeHead(code);
        res.end(content, 'utf-8');
    }

}

var busan = module.exports = new Busan();

var baseCtrl = require('./controller/base.js');
module.exports.controllers['_base'] = baseCtrl;
module.exports.controllers['_base'].init.call(busan, busan, '_base');
