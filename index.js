var es = require('event-stream');
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var async = require('async');
var PluginError = require('gulp-util').PluginError;
var winExt = /^win/.test(process.platform)?".cmd":"";
var console = require('console');

// optimization: cache for phpmetrics binaries directory
var phpmetricsDir = null;

function getPhpmetricsDir() {
    if (phpmetricsDir) {
        return phpmetricsDir;
    }
    var result = require.resolve("phpmetrix");
    if (result) {
        // result is now something like
        phpmetricsDir = path.resolve(path.join(path.dirname(result), "..", ".bin"));
        return phpmetricsDir;
    }
    throw new Error("No phpmetrix installation found.");
}

var phpmetrix = function(config) {

    var child, args;

    // Make sure we have a good default config
    conf = config || 'phpmetrix.yml';

    return es.through(function write(data) {

        this.push(data);

    }, function end() {

        var stream = this;

        child = child_process.spawn(path.resolve(getPhpmetricsDir() + '/phpmetrix'+winExt), [ conf ], {
            stdio: [
                0, // Use parents stdin for child
                'pipe', // Pipe child's stdout to parent
                null, // Pipe child's stderr to parent // fs.openSync('err.out', 'w') // Direct child's stderr to a file
            ],
            env: process.env
        });

        child.stdout.on( 'data', function( data ) {

            // Here data will still be binary, so we need to call toString and then trim on it.
            var dataString = data.toString().trim();

            if( dataString !== '' ) {
                console.log( dataString );
            }
        });

        child.stderr.on('data', function( data ) {

            // Here data will still be binary, so we need to call toString and then trim on it.
            var dataString = data.toString().trim();

            if( dataString !== '' ) {
                console.log( dataString );
            }
        });

        child.on('close', function( code ) {
            //console.log('child process was closed with code:' + code);
        });

        child.on('exit', function( code ) {
            if (child) {
                child.kill();
            }
            if (stream) {
                if (code) {
                    stream.emit('error', new PluginError('gulp-phpmetrix', 'phpmetrix exited with code ' + code));
                }
                else {
                    stream.emit('end');
                }
            }
        });
    });
};

module.exports = {
    getPhpmetricsDir: getPhpmetricsDir,
    phpmetrix: phpmetrix
};
