'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            files: ['controllers/**/*.js', 'lib/**/*.js', 'models/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        clean: {
            'tmp': 'tmp',
            'build': '.build/templates'
        },
        mochacli: {
            src: ['test/*.js'],
            options: {
                globals: ['chai'],
                timeout: 6000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'spec'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-cli');

    grunt.registerTask('i18n', ['clean', 'clean:tmp']); 
    grunt.registerTask('build', ['jshint', 'i18n']); 
    grunt.registerTask('test', ['jshint', 'mochacli']); 
};
