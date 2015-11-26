//load gulp dependancies
var gulp = require('gulp');
    gutil = require('gulp-util');
    argv = require('yargs').argv;
    browserSync = require('browser-sync').create();
    concat = require('gulp-concat');
    cssnano = require('gulp-cssnano');
    imagemin = require('gulp-imagemin');
    postcss = require('gulp-postcss');
    sass = require('gulp-sass');
    sourcemaps = require('gulp-sourcemaps');
    uglify = require('gulp-uglify');
    watch = require('gulp-watch');



//config variables
config = {
    browsersync_location: './template/public',
    public_html: './template/public/templates/dllp',
    indexfile: 'page1.html',
    img_assets: './source/assets/*.{png,jpg,svg}',
    sass: './source/scss/**/*.scss',
    jquery: './node_modules/jquery/dist/jquery.min.js',
    css_framework: './node_modules/foundation-sites/scss',
    jscripts_css_framework: '',
    jscripts_header: './source/lib/header/*.js'
    //'jscripts_footer': './source/lib/footer/*.js'
};


//default and build tasks - 'build-fonts' or 'build-images' optional
gulp.task('default', ['watch', 'browser-sync']);
gulp.task('build', ['build-css', 'build-js']);


//initiate browsersync
gulp.task('browser-sync', function() {
    browserSync.init({
        //proxy: "project.dev",
        server: config.browsersync_location,
        browser: "google chrome",
        index: config.indexfile
    });
});


//watch for events
gulp.task('watch', function () {
    gulp.watch(config.sass, ['build-css']);
    gulp.watch(config.jscripts_header, ['build-js']);
    gulp.watch(config.browsersync_location + '/**/*.html').on('change', browserSync.reload);
    gulp.watch(config.public_html + '/**/*').on('change', browserSync.reload);

    //watch for and copy new images from img assets
    gulp.src(config.img_assets)
    .pipe(watch(config.img_assets))
    .pipe(gulp.dest(config.public_html + '/img'));
});






//build JS Header
gulp.task('build-js', function() {
  return gulp.src([
    config.jquery,
    config.jscripts_css_framework,
    config.jscripts_header])
    .pipe(sourcemaps.init())
      .pipe(concat('header_bundle.js'))
      .pipe(argv.production ? uglify() : gutil.noop())
      .pipe(argv.production ? gutil.noop() : sourcemaps.write('./'))
    .pipe(gulp.dest(config.public_html + '/js'));
});

//Build JS footer
gulp.task('build-js-footer', function() {
  return gulp.src(config.jscripts_footer)
    .pipe(sourcemaps.init())
      .pipe(concat('footer_bundle.js'))
      .pipe(argv.production ? uglify() : gutil.noop())
    .pipe(argv.production ? gutil.noop() : sourcemaps.write())
    .pipe(gulp.dest(config.public_html + '/js'));
    //.pipe(browserSync.stream());
});

//build CSS files
gulp.task('build-css', function() {
    return gulp.src(config.sass)
    .pipe(sourcemaps.init())
    .pipe(sass({includePaths: [config.css_framework]}).on('error', sass.logError))
    .pipe(postcss([
        require('autoprefixer')({ browsers: ['last 2 versions'] }),
        require('css-mqpacker')
     ]))
    .pipe(argv.production ? cssnano({discardComments: {removeAll: true}}) : gutil.noop())
    .pipe(argv.production ? gutil.noop() : sourcemaps.write('./'))
    .pipe(gulp.dest(config.public_html + '/css'))
    .pipe(browserSync.stream());
});


//build fonts
gulp.task('build-fonts', function() {
    return gulp.src(config.bootstrap + '/assets/fonts/**/*')
    .pipe(gulp.dest(config.public_html + '/css' + '/fonts'));
});


//optimize images
gulp.task('build-images', function() {
    if(argv.production) {
        return gulp.src(config.img_assets)
        .pipe(imagemin({
            optimizationLevel: 5,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe(gulp.dest(config.public_html + '/img'));
    }
    else return false;
});

