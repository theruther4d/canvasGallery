import gulp from 'gulp';
import babel from 'babelify';
import rename from 'gulp-rename';
import watchify from 'watchify';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';
import browserify from 'browserify';
import scss from 'gulp-sass';
import prefix from 'gulp-autoprefixer';
import cssMin from 'gulp-minify-css';
import ugly from 'gulp-uglify';

const SRC_DIR = './src';
const OUTPUT_DIR = './dist/';

const compile = ( watch ) => {
    const bundler = watchify(
        browserify(
            `${SRC_DIR}/scripts/main.js`,
            {
                debug: true,
                presets: ['es2015'],
                plugins: ['babel-plugin-transform-es2015-spread', 'babel-plugin-transform-object-rest-spread']
            }
        ).transform( babel ) );

    const rebundle = () => {
        bundler.bundle()
            .on( 'error', ( err ) => {
                console.log( `error: ${err }` );
            })
            .pipe( source( 'canvasGallery.min.js' ) )
            .pipe( buffer() )
            .pipe( ugly() )
            .pipe( gulp.dest( OUTPUT_DIR ) );
    }

    if( watch ) {
        bundler.on( 'update', () => {
            console.log( 'bundling' );
            rebundle();
        });
    }

    rebundle();
};

const watch = () => {
    return compile( true );
}

gulp.task( 'build', () => {
    return compile();
});

gulp.task( 'watch', () => {
    gulp.watch( `${SRC_DIR}/css/partials/*.scss`, ['css'] );
    return watch();
});

gulp.task( 'css', () => {
    return gulp.src( `${SRC_DIR}/css/main.scss` )
        .pipe( scss() )
        .pipe( prefix( ['last 2 version', '> 1%', 'ie 8', 'ie 7', 'Firefox > 15'], { cascade: true } ) )
        .pipe( cssMin() )
        .pipe( rename( 'style.css' ) )
        .pipe( gulp.dest( OUTPUT_DIR ) );
});

gulp.task( 'default', ['css', 'watch'] );
