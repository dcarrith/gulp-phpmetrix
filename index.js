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

var phpmetrix = function(options) {
    var child, conf;

    options = options || {};
    conf = options.conf || 'phpmetrix.yml';

    return es.through(function(conf) {
        this.push(conf);
    }, function() {
        var stream = this;

        phpmetrix = child_process.spawn(path.resolve(getPhpmetricsDir() + '/phpmetrix'+winExt), conf, {
            stdio: [
                0, // Use parents stdin for child
				'pipe', // Pipe child's stdout to parent
    			'pipe', // Pipe child's stderr to parent // fs.openSync('err.out', 'w') // Direct child's stderr to a file
    		],
            env: process.env
        });
        
        phpmetrix.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});

		phpmetrix.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
		});

		phpmetrix.on('close', (code) => {
			console.log(`child process exited with code ${code}`);
		});

        phpmetrix.on('exit', function(code) {
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
