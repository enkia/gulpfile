//load gulp dependancies
var gulp = require('gulp');
	gutil = require('gulp-util');
	browserSync = require('browser-sync').create();
	watch = require('gulp-watch');
	sass = require('gulp-sass');
	concat = require('gulp-concat');
	uglify = require('gulp-uglify');
	sourcemaps = require('gulp-sourcemaps');
	autoprefixer = require('gulp-autoprefixer');
	imagemin = require('gulp-imagemin');
	argv = require('yargs').argv;



//config variables
config = {
    //browsersyncloc: './templates',
    public_html: './templates',
    indexfile: 'page1.html',
    img_assets: './PSD/assets/*.{png,jpg,svg}',
    sass: './source/scss/styles.scss',
    jscripts_header: './source/lib/*.js'
    //'jscripts_footer': './source/lib/footer/*.js'
};




//default and build tasks
gulp.task('default', ['watch', 'browser-sync']);
gulp.task('build', ['build-css', 'build-js-header', 'build-images']);
//'build-images'


//initiate browsersync
gulp.task('browser-sync', function() {
    browserSync.init({
        server: config.public_html,
        //proxy: "mydomainhere.dev",
        browser: "google chrome",
        index: config.indexfile
    });
});


//watch for events
gulp.task('watch', function() {
    gulp.watch(config.sass, ['build-css']);
    gulp.watch(config.jscripts_header, ['build-js-header']);
    //gulp.watch(config.jscripts_footer, ['build-js-footer']);
    gulp.watch(config.public_html + '/**/*').on('change', browserSync.reload);
    gulp.src(config.img_assets) //watch for and copy new images from img assets
        .pipe(watch(config.img_assets))
        .pipe(gulp.dest(config.public_html + '/images'));
});



//Build JS header
gulp.task('build-js-header', function() {
    return gulp.src(config.jscripts_header)
        .pipe(sourcemaps.init())
        .pipe(concat('bundle.js'))
        .pipe(argv.production ? uglify() : gutil.noop())
        .pipe(argv.production ? gutil.noop() : sourcemaps.write())
        .pipe(gulp.dest(config.public_html + '/js'));
    	//.pipe(browserSync.stream());
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
        .pipe(sass({
            outputStyle: argv.production ? 'compressed' : 'expanded'
        }))
        .pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
        .pipe(argv.production ? gutil.noop() : sourcemaps.write('./'))
        .pipe(gulp.dest(config.public_html + '/css'))
        .pipe(browserSync.stream());
});



//optimize images for production only
gulp.task('build-images', function() {
    if (argv.production) {
        return gulp.src(config.img_assets)
            .pipe(imagemin({
                optimizationLevel: 5,
                svgoPlugins: [{
                    removeViewBox: false
                }]
            }))
            .pipe(gulp.dest(config.public_html + '/images'));
    } else return false;
});
