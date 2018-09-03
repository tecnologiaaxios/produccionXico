var gulp = require('gulp');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
let cleanCSS = require('gulp-clean-css');
var uncss = require('gulp-uncss');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('es6', function() {
  gulp.src([
    'js/panel.js',
    'js/pedidosEnProceso.js',
    'js/pedidosVerificados.js',
    'js/pedidoPadre.js',
    'js/login.js'
  ])
		.pipe( babel({presets : ['es2015'], plugins: ["transform-object-rest-spread"]}))
		.pipe(gulp.dest(`babel/`));
});

gulp.task('paneljs', function() {
  gulp.src([
    'vendor/bootstrap/js/bootstrap.min.js',
    'dist/js/bootstrap-select.js',
    'vendor/metisMenu/metisMenu.min.js',
    'dist/js/sb-admin-2.js',
    'vendor/datatables/js/jquery.dataTables.min.js',
    'vendor/datatables-plugins/dataTables.bootstrap.min.js',
    'vendor/datatables-responsive/dataTables.responsive.js',
    'js/bootstrap-datepicker.min.js',
    'js/bootstrap-datepicker.es.min.js',
    'js/bootstrap-tooltip.js',
    'js/jquery.toaster.js',
    'js/firebase.js',
    'js/mindmup-editabletable.js',
    'js/bootstrap-switch.min.js',
    'js/moment-with-locales.js',
    'js/localforage.js',
    'babel/panel.js'
  ])
    .pipe(concat('panel.min.js'))
    .pipe(uglify().on('error', function(e){
      console.log(e);
    }))
    .pipe(gulp.dest('js/'));
});

gulp.task('indexjs', function() {
  gulp.src([
    'vendor/bootstrap/js/bootstrap.min.js',
    'dist/js/bootstrap-select.js',
    'dist/js/sb-admin-2.js',
    'js/bootstrap-tooltip.js',
    'js/firebase.js',
    'babel/login.js'
  ])
    .pipe(concat('index.min.js'))
    .pipe(uglify().on('error', function(e){
      console.log(e);
    }))
    .pipe(gulp.dest('js/'));
});

gulp.task('cleanCSS', function() {
  gulp.src([
    'vendor/bootstrap/css/bootstrap.min.css',
    'css/bootstrap-theme.min.css',
    'vendor/datatables-plugins/dataTables.bootstrap.css',
    'vendor/datatables-responsive/dataTables.responsive.css',
    'vendor/metisMenu/metisMenu.min.css',
    'dist/css/sb-admin-2.css',
    'vendor/morrisjs/morris.css',
    'vendor/font-awesome/css/font-awesome.min.css',
    'css/icon.css',
    'dist/css/bootstrap-select.css',
    'css/dragula.min.css',
    'css/bootstrap-datepicker.min.css',
    'css/bootstrap-datepicker3.min.css',
    'css/bootstrap-datepicker3.standalone.css'
  ])
    .pipe(concat('styles.min.css'))
    .pipe(uncss({
      html: ['panel.html']
    }))
    .pipe(autoprefixer({
			browsers : ['last 5 versions'],
			cascade : false
		}))
    .pipe(cleanCSS())
    .pipe(gulp.dest('css/'));
});