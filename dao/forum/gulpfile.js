var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    header = require("gulp-header");

var jsFile = [
    "source/js/common.js",
    "source/js/index.js",
    "source/js/flexslider.js",  //首页轮播
    "source/js/ajaxPage.js",
    "source/js/forum.js",  //主贴
    "source/js/tags.js",
    "source/js/forumInfo.js",  //帖子详细页
    "source/js/replyForum.js",  //回帖
    "source/js/followForum.js",
    "source/js/forumComment.js",  //评论
    "source/js/searchInfo.js",//搜索结果
    "source/js/forumInfoOperate.js" //帖子操作
];  //顺序是依赖关系
var jsFileWap = [   
    "source/jsWap/common.js",
    "source/jsWap/index.js"    
];  //移动端顺序是依赖关系
var cssFile = [
    "source/css/common.css",
    "source/css/index.css",
    "source/css/flexslider.css", //首页轮播
    "source/css/forumPop.css",
    "source/css/commentEditor.css",
    "source/css/searchInfo.css",//搜索结果样式
    "source/css/forumInfo.css"
];  //需压缩css文件
var cssFileWap = [    
    "source/cssWap/index.css"    
];  //移动端需压缩css文件
var versionJs = "v3.0.0";  //js版本
var versionCss = "v3.0.0";  //css版本

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
//移动端压缩css
gulp.task('minifycssWap', function () {
    return gulp.src(cssFileWap)    //需要操作的文件
        .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(minifycss({
            compatibility: 'ie7'//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
        }))   //执行压缩
        .pipe(header("/*" + versionCss + "*/"))  //注释
        .pipe(gulp.dest('cssWap'));   //输出文件夹
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
//移动端合并，压缩 parts文件夹中的js文件
gulp.task('minifyjsWap', function() {
      gulp.src(jsFileWap)      //需要操作的文件
     
      .pipe(sourcemaps.init())
      .pipe(rename({ suffix: '.min' }))   //rename压缩后的文件名
      
      .pipe(uglify())    //压缩
      .pipe(header("/*" + versionJs + "*/"))  //注释
      .pipe(sourcemaps.write('maps'))
      .pipe(gulp.dest('jsWap'));  //输出
});
//合并压缩ueditor===开始
var versionEditor = "v3.0.2";  //css版本

var jsUEFile = [
    "ueditor/umeditor.js"
];  //顺序是依赖关系

//合并，压缩 parts文件夹中的js文件
gulp.task('minifyUEjs', function() {
      gulp.src(jsUEFile)      //需要操作的文件
      .pipe(sourcemaps.init())
      .pipe(rename({ suffix: '.min' }))   //rename压缩后的文件名      
      .pipe(uglify())    //压缩
      .pipe(header("/*" + versionEditor + "*/"))  //注释
      .pipe(sourcemaps.write('maps'))
      .pipe(gulp.dest('ueditor'));  //输出
});

//合并压缩ueditor===结束

//默认命令，在cmd中输入gulp后，执行的就是这个任务(压缩js需要在检查js之后操作)
gulp.task('default',function() {
    gulp.start('minifyjs');
    gulp.start('minifycss');
    gulp.start('minifyjsWap');
    gulp.start('minifycssWap');
    gulp.start('minifyUEjs');  //ueditor压缩
});