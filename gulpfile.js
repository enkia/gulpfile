// load gulp dependancies
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    argv = require('yargs').argv,
    browserSync = require('browser-sync').create(),
    cache = require('gulp-cached'),
    concat = require('gulp-concat'),
    cssnano = require('gulp-cssnano'),
    imagemin = require('gulp-imagemin'),
    mqpacker = require('css-mqpacker'),
    postcss = require('gulp-postcss'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch');


// Config
var config = {
    dist: './path/to/dist/folder',
    //server: './public',
    assets: './source/assets/*.{png,jpg,svg}',
    index: 'template1.html',
    css: {
        sass: './source/scss/**/*.scss',
        framework: ''//'./node_modules/foundation-sites/scss',
    },
    jscripts: {
        jquery: '',//'./node_modules/jquery/dist/jquery.min.js',
        gridFramework: '',
        header: '',//./source/lib/header/*.js',
        footer: './source/lib/footer/*.js'
    },
    sftp: {
        host: 'server.host.com',
        user: 'username',
        passphrase: 'password',
        remotePath: '/path/to/remote/dist/folder/'
    }
};


// Default and build tasks
gulp.task('default', ['watch', 'browser-sync']);
gulp.task('build', ['build-css', 'build-js', 'build-tpl']);
gulp.task('css', ['build-css']);
gulp.task('js', ['build-js']);
gulp.task('tpl', ['build-tpl']);
gulp.task('svg', ['build-svg']);


// Initialize browsersync
gulp.task('browser-sync', function() {
    if(argv.browsersync) {
        browserSync.init({
            server: config.dist, //config.server,
            //proxy: "something.dev",
            index: config.index,
            browser: 'google chrome',
            notify: false
        });
    }
});


// Watch for events
gulp.task('watch', function() {
    gulp.watch(config.css.sass, ['build-css']);
    gulp.watch(config.jscripts.footer, ['build-js']);
    gulp.watch(config.jscripts.footer, ['build-tpl']);
    //watch for and copy new images from image assets
    /*gulp.src(config.assets)
    .pipe(watch(config.assets))
    .pipe(gulp.dest(config.dist + '/images'))
    .pipe(gulp.dest(config.dist2 + '/images'));*/
    //gulp.watch(config.dist + '/**/*.{html}').on('change', browserSync.reload);
});


// build JS Footer
gulp.task('build-js', function() {
    return gulp.src([
        config.jscripts.jquery,
        config.jscripts.gridFramework,
        config.jscripts.footer
    ])
    .pipe(sourcemaps.init())
      .pipe(concat('footer_bundle.js'))
      .pipe(argv.production ? uglify() : gutil.noop())
      .pipe(argv.production ? gutil.noop() : sourcemaps.write('./'))
    .pipe(gulp.dest(config.dist + '/js'))
    .pipe((argv.production && argv.ftp) ? sftp({
        host: config.sftp.host,
        user: config.sftp.user,
        passphrase: config.sftp.passphrase,
        remotePath: config.sftp.remotePath
        }) : gutil.noop())
    .pipe(argv.browsersync ? browserSync.stream() : gutil.noop());
});


// build JS Header
gulp.task('build-js-header', function() {
    return gulp.src(config.jscripts.header)
    .pipe(sourcemaps.init())
      .pipe(concat('header_bundle.js'))
      .pipe(argv.production ? uglify() : gutil.noop())
    .pipe(argv.production ? gutil.noop() : sourcemaps.write())
    .pipe(gulp.dest(config.dist + '/js'))
    .pipe((argv.production && argv.ftp) ? sftp({
        host: config.sftp.host,
        user: config.sftp.user,
        passphrase: config.sftp.passphrase,
        remotePath: config.sftp.remotePath
        }) : gutil.noop())
    .pipe(argv.browsersync ? browserSync.stream() : gutil.noop());
});



// Build CSS files
gulp.task('build-css', function() {
    return gulp.src(config.css.sass)
    .pipe(sourcemaps.init())
    .pipe(sass( { includePaths: [config.css.framework] } ).on('error', sass.logError))
    .pipe(postcss([mqpacker]))
    .pipe(argv.production ? cssnano({
        discardComments: { removeAll: true },
        autoprefixer:  { browsers: ['last 3 versions', '> 5%', 'ie >= 8'], add: true }
    }) : gutil.noop())
    .pipe(argv.production ? gutil.noop() : sourcemaps.write('./'))
    .pipe(gulp.dest(config.dist + '/css'))
    .pipe((argv.production && argv.ftp) ? sftp({
        host: config.sftp.host,
        user: config.sftp.user,
        passphrase: config.sftp.passphrase,
        remotePath: config.sftp.remotePath
        }) : gutil.noop())
    .pipe(argv.browsersync ? browserSync.stream() : gutil.noop());
});



// Build TPL files
gulp.task('build-tpl', function() {
    return gulp.src('./public/*.html')
    .pipe(cache('html'))
    .pipe(rename(function(path) {
        path.extname = path.basename == 'privacy' ? '.html' : '.tpl';
    }))
    .pipe(gulp.dest(config.dist))
    .pipe((argv.production && argv.ftp) ? sftp({
        host: config.sftp.host,
        user: config.sftp.user,
        passphrase: config.sftp.passphrase,
        remotePath: config.sftp.remotePath
        }) : gutil.noop())
    .pipe(argv.browsersync ? browserSync.stream() : gutil.noop());
});


// Build fonts
gulp.task('build-fonts', function() {
    return gulp.src(config.bootstrap + '/assets/fonts/**/*')
    .pipe(gulp.dest(config.dist + '/css' + '/fonts'));
});


// Optimize images - better to use TinyPNG API on bitmaps
gulp.task('build-images', function() {
    if (argv.production) {
        return gulp.src(config.assets + '/**/*.{png,jpg,svg}')
        .pipe(imagemin({
            optimizationLevel: 5,
            svgoPlugins: [{ removeViewBox: false }]
        }))
        .pipe(gulp.dest(config.dist + '/images'));
    } else {
        return false;
    }
});


// Optimize svg only
gulp.task('build-svg', function() {
    return gulp.src(config.assets + '/*.svg')
    .pipe(cache('svg'))
    .pipe(imagemin({
        optimizationLevel: 5,
        svgoPlugins: [{ removeViewBox: false }]
    }))
    .pipe(gulp.dest(config.assets + '/processed'));
});



