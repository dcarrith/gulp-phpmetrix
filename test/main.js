/*global describe, it*/
'use strict';

var fs = require('fs'),
    es = require('event-stream'),
    expect = require('expect.js'),
    sinon = require('sinon'),
    path = require('path');

require('mocha');

var gutil = require('gulp-util'),
    phpmetrics = require('../').phpmetrics,
    getPhpmetricsDir = require('../').getPhpmetricsDir,
    child_process = require('child_process'),
    events = require('events');

var winExt = /^win/.test(process.platform)?'.cmd':'';

describe('gulp-phpmetrix: getPhpmetricsDir', function() {

    it('should find the phpmetrics installation', function(done) {
		expect(getPhpmetricsDir()).to.equal(path.resolve('./node_modules/.bin'));
		done();
	});
});

	
describe('gulp-phpmetrix: phpmetrics', function() {

    it('should pass in the args into the phpmetrics call', function(done) {
        var fakeProcess = new events.EventEmitter();
        var spy = sinon.stub(child_process, 'spawn', function(cmd, args, options) {

            expect(path.basename(cmd)).to.equal('phpmetrics' + winExt);
            expect(path.basename(args[0])).to.equal('config.yml');
            child_process.spawn.restore();
            done();

            return new events.EventEmitter();
        });
        var srcFile = new gutil.File({
            path: 'test/fixtures/test.js',
            cwd: 'test/',
            base: 'test/fixtures',
            contents: null
        });

        var stream = phpmetrics({
            configFile: 'config.yml',
            args: [
                'config.yml'
            ]
        });

        stream.write(srcFile);
        stream.end();
    });
});
