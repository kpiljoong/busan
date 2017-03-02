'use strict';

// TODO: assigning automatically
var VERSION = '0.0.1';

// Module: commands
var cmds = {
    app: require('./app'),
    version: {
        run: () => {
            console.log('version: ' + VERSION);
        }
    },
    help: require('./help'),
    _help: {
        usage: (args) => {
            showUsage();
        }
    }
};


function run(cmd) {
    // console.log('run: ', arguments);
    function tail(args) {
        return args;
    }

    if (!cmd) {
        showHelp();
        process.exit(1);
    }

    if (!cmds[cmd]) {
        cmd = 'help';
    }

    let args = process.argv.slice(4)[0];
    if (args == null) {
        args = 'usage';
    }
    console.log('cmd:' + cmd + ', args:' + args);
    if (cmds[cmd][args]) {
        cmds[cmd][args](tail(process.argv.slice(4)));
        return;
    }

    if (cmds[cmd].run) {
        cmds[cmd].run(tail(process.argv.slice(4)) || 'usage');
    }
    console.log('WTH?');
}

function showUsage() {
    console.log("showUsage");
    for (var i in cmds) {
        if (cmds[i].usage) {
            cmds[i].usage();
        }
    }
}

function showHelp() {
    console.log("showHelp");
}

module.exports = {
    run: run
};
