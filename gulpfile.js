const { src, dest, series, watch } = require('gulp');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify-es').default;
const del = require('del');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const svgSprite = require('gulp-svg-sprite');
const fileInclude = require('gulp-file-include');
const sourcemaps = require('gulp-sourcemaps');
const htmlmin = require('gulp-htmlmin');
const gulpif = require('gulp-if');
const notify = require('gulp-notify');
const image = require('gulp-image');
const fs = require('fs');
const concat = require('gulp-concat');
const groupMedia = require('gulp-group-css-media-queries');
const ttf2woff = require('gulp-ttf2woff');

let isProd = false;

const fonts = () => {
  return src('./src/fonts/**.ttf')
    .pipe(ttf2woff())
    .pipe(dest('./app/fonts/'))
    .pipe(browserSync.stream());
};

const checkWeight = (fontname) => {
  let weight = 400;
  switch (true) {
    case /Thin/.test(fontname):
      weight = 100;
      break;
    case /ExtraLight/.test(fontname):
      weight = 200;
      break;
    case /Light/.test(fontname):
      weight = 300;
      break;
    case /Regular/.test(fontname):
      weight = 400;
      break;
    case /Medium/.test(fontname):
      weight = 500;
      break;
    case /SemiBold/.test(fontname):
      weight = 600;
      break;
    case /Semi/.test(fontname):
      weight = 600;
      break;
    case /Bold/.test(fontname):
      weight = 700;
      break;
    case /ExtraBold/.test(fontname):
      weight = 800;
      break;
    case /Heavy/.test(fontname):
      weight = 700;
      break;
    case /Black/.test(fontname):
      weight = 900;
      break;
    default:
      weight = 400;
  }
  return weight;
};

const cb = () => {};

let srcFonts = './src/scss/_fonts.scss';
let appFonts = './app/fonts/';

const fontsStyle = (done) => {
  fs.writeFile(srcFonts, '', cb);
  fs.readdir(appFonts, function (err, items) {
    if (items) {
      let c_fontname;
      for (var i = 0; i < items.length; i++) {
        let fontname = items[i].split('.');
        fontname = fontname[0];
        let font = fontname.split('-')[0];
        let weight = checkWeight(fontname);

        if (c_fontname != fontname) {
          fs.appendFile(
            srcFonts,
            '@include font-face("' +
              font +
              '", "' +
              fontname +
              '", ' +
              weight +
              ');\r\n',
            cb
          );
        }
        c_fontname = fontname;
      }
    }
  });
  done();
};

const clean = () => {
  return del(['app/*']);
};

const svgSprites = () => {
  src('./src/img/svg/**.svg')
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: '../sprite.svg',
          },
        },
      })
    )
    .pipe(dest('./app/img/icons'));
  return del(['./app/img/svg']);
};

const styles = () => {
  return src('./src/scss/**/*.scss')
    .pipe(gulpif(!isProd, sourcemaps.init()))
    .pipe(sass().on('error', notify.onError()))
    .pipe(groupMedia())
    .pipe(gulpif(isProd, cleanCSS({ level: 2 })))
    .pipe(gulpif(!isProd, sourcemaps.write('.')))
    .pipe(dest('./app/css/'))
    .pipe(browserSync.stream());
};

const scripts = () => {
  src('./src/js/vendor/**.js')
    .pipe(concat('vendor.js'))
    .pipe(gulpif(isProd, uglify().on('error', notify.onError())))
    .pipe(dest('./app/js/'));
  return src([
    './src/js/functions/**.js',
    './src/js/components/**.js',
    './src/js/index.js',
  ])
    .pipe(gulpif(!isProd, sourcemaps.init()))
    .pipe(concat('index.js'))
    .pipe(gulpif(isProd, uglify().on('error', notify.onError())))
    .pipe(gulpif(!isProd, sourcemaps.write('.')))
    .pipe(dest('./app/js'))
    .pipe(browserSync.stream());
};

const images = () => {
  return src(['./src/img/**/*.{svg,jpg,jpeg,png,ico}'])
    .pipe(gulpif(isProd, image()))
    .pipe(dest('./app/img'))
    .pipe(browserSync.stream());
};

const htmlInclude = () => {
  return src(['./src/*.html'])
    .pipe(
      fileInclude({
        prefix: '@',
        basepath: '@file',
      })
    )
    .pipe(dest('./app'))
    .pipe(browserSync.stream());
};

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: './app',
    },
    notify: false,
  });

  watch('./src/scss/**/*.scss', styles);
  watch('./src/js/**/*.js', scripts);
  watch('./src/html/*.html', htmlInclude);
  watch('./src/*.html', htmlInclude);
  watch('./src/img/*.{jpg,jpeg,png,svg}', images);
  watch('./src/img/svg/**.svg', svgSprites);
  watch('./src/fonts/**.{woff,woff2}', series(fonts, fontsStyle));
};

const htmlMinify = () => {
  return src('app/**/*.html')
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(dest('app'));
};

const toProd = (done) => {
  isProd = true;
  done();
};

exports.default = series(
  clean,
  htmlInclude,
  scripts,
  fonts,
  fontsStyle,
  styles,
  images,
  svgSprites,
  watchFiles
);

exports.build = series(
  toProd,
  clean,
  htmlInclude,
  scripts,
  fonts,
  fontsStyle,
  styles,
  images,
  svgSprites,
  htmlMinify
);
