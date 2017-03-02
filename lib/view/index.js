'use strict';

var fs = require('fs');

class View {
    constructor(ctrl, name) {
        this.ctrl = ctrl;
        this.name = name;
    }

    render() {
        let v = this.read(this.name);
        return v;
    }

    read(name) {
        let filename = './views/' + name;
        if (fs.existsSync(filename)) {
            let content = fs.readFileSync(filename).toString('utf8');
            return content;
        }
        return "NONE";
    }
}

module.exports = View;
