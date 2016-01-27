> Run your [phpmetrics](https://github.com/Halleck45/PhpMetrics) analysis with [gulp](https://github.com/wearefractal/gulp)

[![npm](http://img.shields.io/npm/v/phplint.svg?style=flat)](https://www.npmjs.com/package/phplint)
[![Build Status](https://travis-ci.org/dcarrith/gulp-phpmetrix.svg?branch=master)](https://travis-ci.org/dcarrith/gulp-phpmetrix)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![Dependency Status](https://david-dm.org/wayneashleyberry/phplint/status.svg?style=flat)](https://david-dm.org/wayneashleyberry/phplint#info=dependencies)
[![devDependency Status](https://david-dm.org/wayneashleyberry/phplint/dev-status.svg?style=flat)](https://david-dm.org/wayneashleyberry/phplint#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/github/dcarrith/gulp-phpmetrix/badge.svg?branch=master)](https://coveralls.io/github/dcarrith/gulp-phpmetrix?branch=master)

## Usage

First, install `gulp-phpmetrix` as a development dependency:

```shell
npm install gulp-phpmetrix --save-dev
```

Then, add it to your `gulpfile.js`:

```javascript
// Vanilla gulp task to run phpmetrics
var gulp = require('gulp');

var phpmetrix = require("gulp-phpmetrix").phpmetrix;

gulp.src('')
    .pipe(phpmetrix('phpmetrix.yml'))
    .on('error', function(e) { throw e });

```
Then add a phpmetrix.yml to the root of your site.  Here's an example:
```shell
default:
    rules:
        cyclomaticComplexity: [ 10, 6, 2 ]
        maintainabilityIndex: [ 0, 75, 95 ]

    failure: average.maintainabilityIndex < 50 or sum.loc > 10000

    path:
        directory: .
        extensions: php
        exclude: grunt|node_modules|public|storage|vendor

    logging:
        report:
            #cli:    true
            xml:    ./public/reports/phpmetrics.xml
            html:   ./public/reports/phpmetrics.html
            csv:    ./public/reports/phpmetrics.csv
        violations:
            xml:    ./public/reports/violations.xml
        chart:
            bubbles: ./public/reports/bubbles.svg

```
## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-phpmetrix

[travis-url]: http://travis-ci.org/dcarrith/gulp-phpmetrix
[travis-image]: https://secure.travis-ci.org/dcarrith/gulp-phpmetrix.png?branch=master
