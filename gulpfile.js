var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var clean = require('gulp-clean');
var cssmin = require('gulp-cssmin');
var htmlmin = require('gulp-htmlmin');
var template = require('gulp-template-compile');

var paths = {
	sources: [
		"src/js/util/DataTableUtil.js",
		"src/js/util/MutationViewsUtil.js",
		"src/js/util/MutationDetailsTableFormatter.js",
		"src/js/util/PileupUtil.js",
		"src/js/util/*.js",
		"src/js/model/*.js",
		"src/js/view/*.js",
		"src/js/data/*.js",
		"src/js/component/*.js",
		"src/js/controller/*.js",
		"src/js/MutationMapper.js"
	],
	css: [
		"src/css/mutation_3d.css",
		"src/css/mutation_details.css",
		"src/css/mutation_diagram.css",
		"src/css/mutation_pdb_panel.css",
		"src/css/mutation_pdb_table.css",
		"src/css/mutation_table.css"
	],
	templates: [
		"src/html/mutation_3d_view.html",
		"src/html/mutation_details_table_view.html",
		"src/html/mutation_details_view.html",
		"src/html/mutation_diagram_view.html",
		"src/html/mutation_pdb_panel_view.html",
		"src/html/mutation_pdb_table_view.html"
	],
	frames: [
		"src/html/jsmol_frame.html"
	]
};

var version;

gulp.task('default', function() {

});

gulp.task('version', function() {
	//var now = new Date();
	//version = process.env['VERSION'];
	version = '1.0';
});

gulp.task('build', ['version'], function() {
	return gulp.src( paths.sources )
		//.pipe( replace('{{VERSION}}', version) )
		.pipe( concat('mutationMapper.js') )
		.pipe( gulp.dest('build') )
		.pipe( uglify({
			mangle: true,
			preserveComments: 'some'
		}) )
		.pipe( concat('mutationMapper.min.js') )
		.pipe( gulp.dest('build') );
});

gulp.task('clean', function() {
	return gulp.src(['build'])
		.pipe( clean({ read: false }) );
});

gulp.task('template', function() {
	return gulp.src(paths.templates)
		.pipe( concat('mutationMapperTemplates.html') )
		.pipe( gulp.dest('build') )
		.pipe( template({
			name: function(file) {
				return "mutationViews";
			},
			namespace: "backbone-template"
		}) )
		.pipe( concat('mutationMapperTemplates.js') )
		.pipe( gulp.dest('build') );
});

gulp.task('copy', function() {
	return gulp.src(paths.frames)
		//.pipe( concat('mutationMapperTemplates.html') )
		.pipe( gulp.dest('build') );
});

gulp.task('cssmin', function() {
	return gulp.src( paths.css )
		.pipe( concat('mutationMapper.css') )
		.pipe( gulp.dest('build') )
		.pipe( cssmin() )
		.pipe( concat('mutationMapper.min.css') )
		.pipe( gulp.dest('build') );
});

// TODO inject: js into debug.html

gulp.task('make', ['clean', 'build', 'cssmin', 'template', 'copy']);
