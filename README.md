# gulp-phpmetrix [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

> Run your [phpmetrics](https://github.com/Halleck45/PhpMetrics) analysis with [gulp](https://github.com/wearefractal/gulp)

## Usage

First, install `gulp-phpmetrix` as a development dependency:

```shell
npm install --save-dev gulp-phpmetrix
```

Then, add it to your `gulpfile.js`:

```javascript
var phpmetrix = require("gulp-phpmetrix").phpmetrix;

gulp.src(["./src/tests/*.js"])
	.pipe(phpmetrix({
		configFile: "config.yml",
		args: ['config.yml']
	}))
	.on('error', function(e) { throw e })
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-phpmetrix

[travis-url]: http://travis-ci.org/dcarrith/gulp-phpmetrix
[travis-image]: https://secure.travis-ci.org/dcarrith/gulp-phpmetrix.png?branch=master
