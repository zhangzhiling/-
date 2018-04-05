var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    header = require("gulp-header");

var jsFile = [
	"source/js/activeOpenBox.js",
   "source/js/jquery.ajaxpageNew.js",
    "source/js/trade.js",
    "source/js/common.js",
    "source/js/recharge.js",
    "source/js/gift.js",
    "source/js/ranking.js",//首页排行榜
    "source/js/box.js"
];  //顺序是依赖关系
var cssFile = [
	"source/css/activeOpenBox.css",
	"source/css/trade.css",
    "source/css/common.css",
    "source/css/recharge.css",
    "source/css/ranking.css",//首页排行榜
    "source/css/gift.css"
];  //需压缩css文件


var versionJs = "v1.0.1";  //js版本
var versionCss = "v1.0.1";  //css版本

//压缩css
gulp.task('minifycss', function () {
    return gulp.src(cssFile)    //需要操作的文件
        .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(minifycss({
            compatibility: 'ie7'//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
        }))   //执行压缩
        .pipe(header("/*" + versionCss + "*/"))  //注释
        .pipe(gulp.dest('css'));   //输出文件夹
});
//合并，压缩 parts文件夹中的js文件
gulp.task('minifyjs', function() {
      gulp.src(jsFile)      //需要操作的文件
     
      .pipe(sourcemaps.init())
      .pipe(rename({ suffix: '.min' }))   //rename压缩后的文件名
      
      .pipe(uglify())    //压缩
      .pipe(header("/*" + versionJs + "*/"))  //注释
      .pipe(sourcemaps.write('maps'))

      .pipe(gulp.dest('js'));  //输出
});

//默认命令，在cmd中输入gulp后，执行的就是这个任务(压缩js需要在检查js之后操作)
gulp.task('default',function() {
    gulp.start('minifyjs');
    gulp.start('minifycss');
});