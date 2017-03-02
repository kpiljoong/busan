'use strict';

class Controller {
    constructor(busan, req, res) {
        this.busan = busan;
        this.req = req;
        this.res = res;

        // optimistic!
        this.code = 200;
    }

    view(name) {
        let view = this.busan.view(this, name);
        if (view === null) {
            throw new Error(`Error: can not find a view for the name: ${name}`);
        }
        this.busan.response(this.req, this.res, this.code, 'text/html', view);
    }
}

module.exports = Controller;
