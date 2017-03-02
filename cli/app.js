'use nodent';
'use strict';

var path = require('path'),
    mkdirp = require('mkdirp'),
    iconv = require('iconv-lite'),
    fs = require('fs'),
    template = require('./template'),
    isBinaryFile = require('isbinaryfile'),
    _ = require('lodash');

class App {
    constructor() {
        this.mkdir = mkdirp.sync.bind(mkdirp);
    }

    info(msg) {
        console.log('APP: ' + msg);
    }

    usage() {
        this.info("Show usage");
    }

    template(src, dest, data) {
        dest = dest || src;
        data = data || this;

        let body = this.read(src, 'utf8');
        body = this.engine(body, data);
        this.info('aaa', body);

        this.write(dest, body);
    }

    read(filepath, encoding) {
        if (!this.isAbsolutePath(filepath)) {
            filepath = path.join(this.srcRoot(), filepath);
        }

        try {
            console.log('aaaa', String(filepath));
            let content = fs.readFileSync(String(filepath));
            if (encoding !== null) {
                content = iconv.decode(content, encoding || 'utf8');
                if (content.charCodeAt(0) === 0xFEFF) {
                    content = content.substring(1);
                }
            }
            return content;
        } catch (e) {
            throw new Error(`Unable to read ${filepath} (${e.code} - ${e})`);
        }
    }

    write(filepath, content) {
        mkdirp.sync(path.dirname(filepath));
        fs.writeFileSync(filepath, content);
    }

    copy(src, dest, process) {
        let file = this.prepareCopy(src, dest, process);
        try {
            file.body = this.engine(file.body, this);
        } catch (err) {
            console.error(`Something went wrong #{file}`);
        }

        mkdirp.sync(path.dirname(file.dest));
        fs.writeFileSync(file.dest, file.body);
        let stats = fs.statSync(file.src);
        try {
            fs.chmodSync(file.dest, stats.mode);
            fs.utimesSync(file.dest, stats.atime, stats.mtime);
        } catch (err) {
            console.error(`Error setting permission of ${file.dest} file: ${err}`);
        }
    }

    prepareCopy(src, dest, process) {
        dest = dest || src;

        if (typeof dest === 'function') {
            process = dest;
            dest = src;
        }

        src = this.isAbsolutePath(src) ? src : path.join(this.srcRoot(), src);
        dest = this.isAbsolutePath(dest) ? dest : path.join(this.destRoot(), dest);

        let encoding = null;
        let binary = isBinaryFile.sync(src);
        if (!binary) {
            encoding = 'utf8';
        }

        let body = fs.readFileSync(src, encoding);

        if (typeof process === 'function' && !binary) {
            body = process(body, src, dest, {encoding: encoding});
        }

        return {
            body: body,
            encoding: encoding,
            dest: dest,
            src: src
        };
    }

    isAbsolutePath() {
        let filepath = path.join.apply(path, arguments);
        return path.resolve(filepath) === filepath;
    }

    engine(body, data) {
        return template.detect && template.detect(body)
            ? template.parse(body, data)
            : body;
    }

    srcRoot(rootPath) {
        if (_.isString(rootPath)) {
            this._srcRoot = path.resolve(rootPath);
        }
        return this._srcRoot;
    }

    destRoot(rootPath) {
        if (_.isString(rootPath)) {
            this._destRoot = path.resolve(rootPath);
            if (!fs.existsSync(rootPath)) {
                this.mkdir(rootPath);
            }
            process.chdir(rootPath);
        }
        return this._destRoot || process.cwd();
    }

    async askInfo(prompts) {
        let self = this;
        let inquirer = require('inquirer');
        inquirer.prompt(prompts).then((answers) => {
            _(answers).forEach((v, k) => self[k] = v);
            console.log('aaa', self, answers);
            async return undefined;
        });
    }

    async create(appName) {
        this.info('create app: ' + appName);

        let prompts = [];
        prompts.push({
            name: 'appName',
            message: 'Application name'
        });

        await this.askInfo(prompts);

        let templatePath = path.join(__dirname, 'templates');
        this.mkdir(this.appName);
        process.chdir(this.appName);

        this.info('Directories...');
        this.srcRoot(templatePath);
        this.mkdir('config');
        this.mkdir('controllers');
        this.mkdir('lib');
        this.mkdir('models');
        this.mkdir('test');

        this.info('Templates...');
        this.template('_README.md', 'README.md');
        this.template('_package.json', 'package.json');
        this.template('config/_app.json', 'config/app.json');
        this.template('config/_middleware.json', 'config/middleware.json');

        this.info('Copying...');
        this.copy('index.js', 'index.js');
        this.copy('gitignore', '.gitignore');
        this.copy('jshintrc', '.jshintrc');
        this.copy('Gruntfile.js', 'Gruntfile.js');
    }
}


module.exports = new App();
