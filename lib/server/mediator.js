'use strict';

var Controller = require('../controller');

class Mediator {
    constructor(busan, req, res, route, middlewares) {
        this.busan = busan;
        this.req = req;
        this.res = res;
        this.route = route;
        this.middlewares = middlewares;

        this.handlers = {
            onEnd: this.onEnd.bind(this)
        };
    }

    end() {
        this.interact();
    }

    onEnd() {
        this.interact();
    }

    interact() {
        if (this.route === null) {
            throw new Error('can not find route');
        } else {
            this.execute();
        }
    }

    execute() {
        if (this.route === null) {
            this.busan.response(this.req, this.res, 404, 'text/plain', 'Not Found');
            return;
        }

        let handler = this.route.handler;
        if (handler === null) {
            this.busan.response(this.req, this.res, 500, 'text/plain', 'Internal Error');
            return;
        }

        let index = 0;
        let length = this.middlewares.length;
        let ctrl = new Controller(this.busan, this.req, this.res);
        let self = this;
        function next(err) {
            if (index >= length) {
                self.route.handler.call(ctrl);
                return;
            }
            try {
                let mw = self.middlewares[index++];
                if (mw === null) {
                    throw new Error('Middleware is broken');
                }
                mw.obj.handle.call(ctrl, next);
            } catch (e) {
                console.error(`Middleware Error: ${e}`);
                next(e);
            }
        }
        next();
    }
}

module.exports = Mediator;
