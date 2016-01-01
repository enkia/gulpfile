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

//public_root: './public',
//dist: './public/application/themes/sitename',
// path variables
path = {
    dist: './template',
    indexfile: 'page1.html',
    assets: './source/assets/*.{png,jpg,svg}',
    css: {
        sass: './source/scss/**/*.scss',
        framework: './node_modules/foundation-sites/scss',
    },
    jscripts: {
        jquery: './node_modules/jquery/dist/jquery.min.js',
        cssFramework: '',
        header: '',//./source/lib/header/*.js',
        footer: './source/lib/footer/*.js'
    }
};


// default and build tasks
gulp.task('default', ['watch', 'browser-sync']);
gulp.task('build', ['build-css', 'build-js']);
gulp.task('css', ['build-css']);
gulp.task('js', ['build-js']);
gulp.task('tpl', ['build-tpl']);
gulp.task('svg', ['build-svg']);


// initialize browsersync
gulp.task('browser-sync', function() {
    browserSync.init({
        //proxy: "devfront.ilandinst.dev",
        server: path.dist,
        browser: "google chrome",
        index: path.indexfile,
        notify: false
    });
});


// watch for events
gulp.task('watch', function () {
    gulp.watch(path.css.sass, ['build-css']);
    gulp.watch(path.jscripts.footer, ['build-js']);
    //gulp.watch(path.public_root + '/*.html', ['build-tpl']);
    gulp.watch(path.dist + '/**/*.{css,js,html,php,tpl,png,jpg,svg}').on('change', browserSync.reload);

    //watch for and copy new images from image assets
    gulp.src(path.assets)
    .pipe(watch(path.assets))
    .pipe(gulp.dest(path.dist + '/images'));
});



// build JS Footer
gulp.task('build-js', function() {
    return gulp.src([
        path.jscripts.jquery,
        path.jscripts.cssFramework,
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
    .pipe(gulp.dest(path.dist + '/js'));
});


// build CSS files
gulp.task('build-css', function() {
    return gulp.src(path.css.sass)
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
    return gulp.src(path.public_root + '/*.html')
    .pipe(cache('html'))
    .pipe(rename(function(path) {
        path.extname = path.basename == "privacy" ? '.html' : '.tpl';
    }))
    .pipe(gulp.dest(path.dist));
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
    .pipe(gulp.dest(path.dist + '/images'));
});



