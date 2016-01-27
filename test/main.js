/*global describe, it*/
'use strict';

var fs = require('fs'),
    es = require('event-stream'),
    expect = require('expect.js'),
    sinon = require('sinon'),
    path = require('path');

require('mocha');

var gutil = require('gulp-util'),
    phpmetrix = require('../').phpmetrix,
    getPhpmetricsDir = require('../').getPhpmetricsDir,
    child_process = require('child_process'),
    events = require('events');

var winExt = /^win/.test(process.platform)?'.cmd':'';

process.env.NODE_ENV = 'test';

var configFilePath = __dirname + '/config.yml';
var nonConfigFilePath = __dirname + '/nonconfig.yml';

// Base directory to which the artifacts should be saved
var reportsDir = 'test/reports/';

var reportXML       = reportsDir + 'phpmetrics.xml';
var reportHTML      = reportsDir + 'phpmetrics.html';
var reportJSON      = reportsDir + 'phpmetrics.json';
var reportCSV       = reportsDir + 'phpmetrics.csv';
var violationsXML   = reportsDir + 'violations.xml';
var bubblesSVG      = reportsDir + 'bubbles.svg';

var options = { stdio: 'inherit',
                quiet: false,
                debug: false,
                args: [ '--report-cli',
                        '--report-html='    + reportHTML,
                        '--report-xml='     + reportXML,
                        '--report-json='    + reportJSON,
                        '--report-csv='     + reportCSV,
                        '--violations-xml=' + violationsXML,
                        '--chart-bubbles='  + bubblesSVG,
                        '--extensions=php',
                        '--excluded-dirs="grunt|node_modules|public|storage|vendor"',
                        '--ansi',
                        '--no-ansi',
                        '--template-title="PHPMetrix"',
                        '--verbose'
                ],
                path: 'app/',
                config: configFilePath };

function generateTestValueFromOptions( options ) {

    // Deep clone the options object so it won't be modified globally
    var options = JSON.parse( JSON.stringify( options ));
    var args = [];

    var quiet = (( !options.quiet ) ? false : options.quiet );
    var debug = (( !options.debug ) ? false : options.debug );

    if( options.args ) {
        args = options.args;
    }

    if( options.config ) {
        if( args.indexOf( '--config=' + options.config ) < 0 ) {
            args.unshift( '--config=' + options.config );
        }
    }

    if( options.path ) {

        if( args.indexOf( options.path ) < 0 ) {
            args.push( options.path );
        }

    } else {
        if( args.indexOf( '"."' ) < 0 ) {
            args.push( '"."' );
        }
    }

    var ansi = args.indexOf('--ansi') - 1;
    var noansi = args.indexOf('--no-ansi') - 1;

    // Check for the possibility of passing in two conflicting options
    if(( ansi >= 0 ) && ( noansi >= 0 )) {

        // Slice off the one that was entered second
        args.splice((( ansi > noansi ) ? ansi : noansi), 1);
    }

    return args.join(' ');
}

describe( 'gulp-phpmetrix: getPhpmetricsDir', function() {

    it('should find the phpmetrics installation', function( done ) {
        expect( getPhpmetricsDir() ).to.equal(path.resolve('./node_modules/.bin'));
        done();
    });
});

describe( 'gulp-phpmetrix: phpmetrix', function() {

    it('should parse the args out of the options', function( done ) {

        var spy = sinon.stub( child_process, 'spawn', function( cmd, args, opts ) {

            expect( path.basename( cmd )).to.equal( 'phpmetrix' + winExt );
            expect( args[0] ).to.equal( '--config=' + options.config );
            expect( args[1] ).to.equal( options.args[0] ); // Still start at index 0 because --config get's added to top
            expect( args[2] ).to.equal( options.args[1] );
            expect( args[3] ).to.equal( options.args[2] );
            expect( args[4] ).to.equal( options.args[3] );
            expect( args[5] ).to.equal( options.args[4] );
            expect( args[6] ).to.equal( options.args[5] );
            expect( args[7] ).to.equal( options.args[6] );
            expect( args[8] ).to.equal( options.args[7] );
            expect( args[9] ).to.equal( options.args[8] );
            expect( args[10] ).to.equal( options.args[10] ); // Go from 8 to 10 since we only need one ansi or no-ansi
            expect( args[11] ).to.equal( options.args[11] );
            expect( args[12] ).to.equal( options.args[12] );
            expect( args.join( ' ' )).to.equal( generateTestValueFromOptions( options ));

            child_process.spawn.restore();
            done();

            return new events.EventEmitter();
        });

        var srcFile = new gutil.File({
            path: 'test/main.js',
            cwd: 'test/',
            base: 'test/',
            contents: null
        });

        var stream = phpmetrix( options );
        stream.write( srcFile );
        stream.end();
    });
    it('should parse and use the stdio option properly', function( done ) {

        options = { stdio: 'inherit',
                    stdin: 0,
                    stdout: 'pipe',
                    stderr: null,
                    path: 'app/',
                    config: configFilePath };

        var spy = sinon.stub( child_process, 'spawn', function( cmd, args, opts ) {

            if( opts.stdio !== 'undefined' ) {

                expect( opts.stdio ).to.equal( options.stdio );

            } else {

                if( opts.stdin !== 'undefined' ) {

                    expect( opts.stdin ).to.equal( options.stdin );

                } else if( opts.stdout !== 'undefined' ) {

                    expect( opts.stdout ).to.equal( options.stdout );

                } else if( opts.stderr !== 'undefined' ) {

                    expect( opts.stderr ).to.equal( options.stderr );
                }
            }

            child_process.spawn.restore();
            done();

            return new events.EventEmitter();
        });

        var srcFile = new gutil.File({
            path: 'test/main.js',
            cwd: 'test/',
            base: 'test/',
            contents: null
        });

        var stream = phpmetrix( options );
        stream.write( srcFile );
        stream.end();
    });

    it('should parse and use the stdin/stdout/stderr options properly', function( done ) {

        options = { stdin: 0,
                    stdout: 'pipe',
                    stderr: null,
                    path: 'app/',
                    config: configFilePath };

        var spy = sinon.stub( child_process, 'spawn', function( cmd, args, opts ) {

            if( opts.stdio !== 'undefined' ) {

                expect( opts.stdio ).to.equal( options.stdio );

            } else {

                if( opts.stdin !== 'undefined' ) {

                    expect( opts.stdin ).to.equal( options.stdin );

                } else if( opts.stdout !== 'undefined' ) {

                    expect( opts.stdout ).to.equal( options.stdout );

                } else if( opts.stderr !== 'undefined' ) {

                    expect( opts.stderr ).to.equal( options.stderr );
                }
            }

            child_process.spawn.restore();
            done();

            return new events.EventEmitter();
        });

        var srcFile = new gutil.File({
            path: 'test/main.js',
            cwd: 'test/',
            base: 'test/',
            contents: null
        });

        var stream = phpmetrix( options );
        stream.write( srcFile );
        stream.end();
    });
});
