var es = require( 'event-stream' );
var fs = require( 'fs' );
var path = require( 'path' );
var child_process = require( 'child_process' );
var async = require( 'async' );
var PluginError = require( 'gulp-util' ).PluginError;
var winExt = /^win/.test( process.platform )?".cmd":"";
var console = require( 'console');

// optimization: cache for phpmetrics binaries directory
var phpmetricsDir = null;

function getPhpmetricsDir() {

    if ( phpmetricsDir ) {
        return phpmetricsDir;
    }

    var result = require.resolve( "phpmetrix" );

    if( result ) {
        // result is now something like
        phpmetricsDir = path.resolve( path.join( path.dirname( result ), "..", ".bin" ));
        return phpmetricsDir;
    }

    throw new Error( "No phpmetrix installation found." );
}

function generateSpawnOptions( options ) {

    // Default stdio to inherit settings from parent
    var stdio = 'undefined';
    var stdin = 0;
    var stdout = 'pipe';
    var stderr = null;

    // If stdio is set, it takes precedence over the sub values
    if( options.stdio !== 'undefined' ) {

        stdio = options.stdio;

    } else {

        if( options.stdin !== 'undefined' ) {
            stdin = options.stdin;
        }

        if( options.stdout !== 'undefined' ) {
            stdout = options.stdout;
        }

        if( options.stderr !== 'undefined' ) {
            stderr = options.stderr;
        }
    }

    var spawnOptions = { stdio: stdio,
                         env: process.env };

    if( stdio === 'undefined' ) {

        spawnOptions = { stdio: [ stdin,  // Use parents stdin for child
                                  stdout, // Pipe child's stdout to parent
                                  stderr, // Pipe child's stderr to parent
                                  // fs.openSync('err.out', 'w') // Direct child's stderr to a file
                                ],
                         env: process.env
                       };
    }

    return spawnOptions;
}

function extractArgumentsFromOptions( options ) {

    var args = [];

    options.quiet = (( !options.quiet ) ? false : options.quiet );
    options.debug = (( !options.debug ) ? false : options.debug );

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

    return args;
}

var phpmetrix = function( options ) {

    // Deep clone the options object so it won't be modified globally
    var options = JSON.parse( JSON.stringify( options ));

    var child;

    var args = extractArgumentsFromOptions( options );

    return es.through(function write(data) {

        this.push(data);

    }, function end() {

        var stream = this;

        var spawnOptions = generateSpawnOptions( options );

        child = child_process.spawn( path.resolve( getPhpmetricsDir() + '/phpmetrix' + winExt ), args, spawnOptions );

        /*if( stdout === 'pipe' ) {

            child.stdout.on( 'data', function( data ) {

                console.log(data);

                if( !quiet ) {

                    // Here data will still be binary, so we need to call toString and then trim on it.
                    var dataString = data.toString().trim();

                    if( dataString !== '' ) {
                        console.log( dataString );
                    }
                }
            });
        }

        if( stderr === 'pipe' ) {

            child.stderr.on('data', function( data ) {

                if( debug && !quiet ) {

                    // Here data will still be binary, so we need to call toString and then trim on it.
                    var dataString = data.toString().trim();

                    if( dataString !== '' ) {
                        console.log( dataString );
                    }
                }
            });
        }

        child.on('close', function( code ) {

            if( debug && !quiet ) {

                console.log('child process was closed with code:' + code);
            }
        });*/

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

