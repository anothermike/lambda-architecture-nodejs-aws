var grunt = require('grunt');
var async = require('async');

grunt.initConfig({
    generateEvents: {
        default: {
            function: 'generateEvents'
        }
    }
});

grunt.loadTasks('tasks');