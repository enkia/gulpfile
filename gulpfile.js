// load gulp dependancies
var gulp = require('gulp');
    gutil = require('gulp-util');
    argv = require('yargs').argv;
    autoprefixer = require('autoprefixer');
    browserSync = require('browser-sync').create();
    cache = require('gulp-cached');
    concat = require('gulp-concat');
    cssnano = require('gulp-cssnano');
    imagemin = require('gulp-imagemin');
    mqpacker = require('css-mqpacker');
    postcss = require('gulp-postcss');
    rename = require('gulp-rename');
    sass = require('gulp-sass');
    sourcemaps = require('gulp-sourcemaps');
    uglify = require('gulp-uglify');
    watch = require('gulp-watch');
    newer = require('gulp-newer');

//public_root: './public',
// path variables
path = {
    dist: './public/templates/longform1_2016',
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
    }
};


// default and build tasks
gulp.task('default', ['watch', 'browser-sync']);
gulp.task('build', ['build-css', 'build-js', 'build-tpl']);
gulp.task('css', ['build-css']);
gulp.task('js', ['build-js']);
gulp.task('tpl', ['build-tpl']);
gulp.task('svg', ['build-svg']);


// initialize browsersync
gulp.task('browser-sync', function() {
    browserSync.init({
        server: path.dist,
        //proxy: "something.dev",
        index: path.index,
        browser: "google chrome",
        notify: false
    });
});


// watch for events
gulp.task('watch', function () {
    gulp.watch(path.css.sass, ['build-css']);
    gulp.watch(path.jscripts.footer, ['build-js']);
    gulp.watch(path.jscripts.footer, ['build-tpl']);
    //watch for and copy new images from image assets
    /*gulp.src(path.assets)
    .pipe(watch(path.assets))
    .pipe(gulp.dest(path.dist + '/images'))
    .pipe(gulp.dest(path.dist2 + '/images'));*/
    //gulp.watch(path.dist + '/**/*.{html}').on('change', browserSync.reload);
});


// build JS Footer
gulp.task('build-js', function() {
    return gulp.src([
        path.jscripts.jquery,
        path.jscripts.gridFramework,
        path.jscripts.footer
    ])
    .pipe(sourcemaps.init())
      .pipe(concat('footer_bundle.js'))
      .pipe(argv.production ? uglify() : gutil.noop())
      .pipe(argv.production ? gutil.noop() : sourcemaps.write('./'))
    .pipe(gulp.dest(path.dist + '/js'))
    .pipe(browserSync.stream());
});


// build JS Header
gulp.task('build-js-header', function() {
  return gulp.src(path.jscripts.header)
    .pipe(sourcemaps.init())
      .pipe(concat('header_bundle.js'))
      .pipe(argv.production ? uglify() : gutil.noop())
    .pipe(argv.production ? gutil.noop() : sourcemaps.write())
    .pipe(gulp.dest(path.dist + '/js'))
    .pipe(browserSync.stream());
});


// build CSS files
gulp.task('build-css', function() {
    return gulp.src(path.css.sass)
    .pipe(cache('scss'))
    .pipe(sourcemaps.init())
    .pipe(sass( {includePaths: [path.css.framework]} ).on('error', sass.logError))
    .pipe(postcss([
        //require('postcss-scss'),
        //require('precss'),
        //require('lost'),
        autoprefixer({ browsers: ['last 3 versions', '> 5%', 'ie >= 8'] }),
        mqpacker
     ]))
    .pipe(argv.production ? cssnano({discardComments: {removeAll: true}}) : gutil.noop())
    .pipe(argv.production ? gutil.noop() : sourcemaps.write('./'))
    .pipe(gulp.dest(path.dist + '/css'))
    .pipe(browserSync.stream());
});



// build TPL files
gulp.task('build-tpl', function() {
    return gulp.src('./public/*.html')
    .pipe(cache('html'))
    .pipe(rename(function(path) {
        path.extname = path.basename == "privacy" ? '.html' : '.html';
    }))
    .pipe(gulp.dest(path.dist))
    .pipe(browserSync.stream());
});


// build fonts
gulp.task('build-fonts', function() {
    return gulp.src(path.bootstrap + '/assets/fonts/**/*')
    .pipe(gulp.dest(path.dist + '/css' + '/fonts'));
});


// optimize images - better to use TinyPNG API on bitmaps
gulp.task('build-images', function() {
    if(argv.production) {
        return gulp.src(path.assets + '/**/*.{png,jpg,svg}')
        .pipe(imagemin({
            optimizationLevel: 5,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe(gulp.dest(path.dist + '/images'));
    }
    else return false;
});


// optimize svg only
gulp.task('build-svg', function() {
    return gulp.src(path.assets + '/*.svg')
    .pipe(cache('svg'))
    .pipe(imagemin({
        optimizationLevel: 5,
        svgoPlugins: [{removeViewBox: false}]
    }))
    .pipe(gulp.dest(path.assets + '/processed'));
});



