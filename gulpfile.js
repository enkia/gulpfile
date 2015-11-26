// load gulp dependancies
var gulp = require('gulp');
    gutil = require('gulp-util');
    argv = require('yargs').argv;
    browserSync = require('browser-sync').create();
    concat = require('gulp-concat');
    cssnano = require('gulp-cssnano');
    imagemin = require('gulp-imagemin');
    postcss = require('gulp-postcss');
    rename = require('gulp-rename');
    sass = require('gulp-sass');
    sourcemaps = require('gulp-sourcemaps');
    uglify = require('gulp-uglify');
    watch = require('gulp-watch');


// config
config = {
    public_root: './public',
    dist: './public/templates/dllp',
    indexfile: 'page1.html',
    assets: './source/assets/*.{png,jpg,svg}',
    sass: './source/scss/**/*.scss',
    jquery: './node_modules/jquery/dist/jquery.min.js',
    css_framework: './node_modules/foundation-sites/scss',
    jscripts_css_framework: '',
    jscripts_header: './source/lib/header/*.js',
    jscripts_footer: './source/lib/footer/*.js'
};


// default and build tasks
gulp.task('default', ['watch', 'browser-sync']);
gulp.task('build', ['build-css', 'build-js', 'build-tpl']);


// initialize browsersync
gulp.task('browser-sync', function() {
    browserSync.init({
        //proxy: "project.dev",
        server: config.public_root,
        browser: "google chrome",
        index: config.indexfile
    });
});


// watch for events
gulp.task('watch', function () {
    gulp.watch(config.sass, ['build-css']);
    gulp.watch(config.jscripts_header, ['build-js']);
    gulp.watch(config.public_root + '/*.html', ['build-tpl']);
    gulp.watch(config.public_root + '/*.html').on('change', browserSync.reload);
    gulp.watch(config.dist + '/**/*').on('change', browserSync.reload);

    //watch for and copy new images from img assets
    gulp.src(config.assets)
    .pipe(watch(config.assets))
    .pipe(gulp.dest(config.dist + '/img'));
});



// build TPL files
gulp.task('build-tpl', function() {
    return gulp.src(config.public_root + '/*.html')
    .pipe(rename(function(path) {
        path.extname = path.basename == "privacy" ? '.html' : '.tpl';
    }))
    .pipe(gulp.dest(config.dist));
});


// build JS Header
gulp.task('build-js', function() {
  return gulp.src([
    config.jquery,
    config.jscripts_css_framework,
    config.jscripts_header])
    .pipe(sourcemaps.init())
      .pipe(concat('header_bundle.js'))
      .pipe(argv.production ? uglify() : gutil.noop())
      .pipe(argv.production ? gutil.noop() : sourcemaps.write('./'))
    .pipe(gulp.dest(config.dist + '/js'));
});


// build JS footer
gulp.task('build-js-footer', function() {
  return gulp.src(config.jscripts_footer)
    .pipe(sourcemaps.init())
      .pipe(concat('footer_bundle.js'))
      .pipe(argv.production ? uglify() : gutil.noop())
    .pipe(argv.production ? gutil.noop() : sourcemaps.write())
    .pipe(gulp.dest(config.dist + '/js'));
});


// build CSS files
gulp.task('build-css', function() {
    return gulp.src(config.sass)
    .pipe(sourcemaps.init())
    .pipe(sass( {includePaths: [config.css_framework]} ).on('error', sass.logError))
    .pipe(postcss([
        //require('postcss-scss'),
        //require('precss'),
        //require('lost'),
        require('autoprefixer')({ browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3'] }),
        require('css-mqpacker')
     ]))
    .pipe(argv.production ? cssnano({discardComments: {removeAll: true}}) : gutil.noop())
    .pipe(argv.production ? gutil.noop() : sourcemaps.write('./'))
    .pipe(gulp.dest(config.dist + '/css'))
    .pipe(browserSync.stream());
});


// build fonts
gulp.task('build-fonts', function() {
    return gulp.src(config.bootstrap + '/assets/fonts/**/*')
    .pipe(gulp.dest(config.dist + '/css' + '/fonts'));
});


// optimize images
gulp.task('build-images', function() {
    if(argv.production) {
        return gulp.src(config.assets)
        .pipe(imagemin({
            optimizationLevel: 5,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe(gulp.dest(config.dist + '/img'));
    }
    else return false;
});

