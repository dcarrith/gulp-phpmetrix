var es = require('event-stream');
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var async = require('async');
var PluginError = require('gulp-util').PluginError;
var winExt = /^win/.test(process.platform)?".cmd":"";
var console = require('console');

// optimization: cache for phpmetrics binaries directory
var phpmetricsDir = "/usr/local/bin/phpmetrics";

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
	var files = [],
		child, args;

	options = options || {};
	args = options.args || [];

	return es.through(function(file) {
		files.push(file.path);
		this.push(file);
	}, function() {
		var stream = this;

		// Enable debug mode
		if (options.debug) {
			args.push('debug');
		}

		// Attach Files, if any
		if (files.length) {
			args.push('--specs');
			args.push(files.join(','));
		}

		// Pass in the config file
		if (options.configFile) {
			args.unshift(options.configFile);
		}

		child = child_process.spawn(path.resolve(getPhpmetrixDir() + '/phpmetrix'+winExt), args, {
			stdio: 'inherit',
			env: process.env
		}).on('exit', function(code) {
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
