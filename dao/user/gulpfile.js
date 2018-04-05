var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    header = require("gulp-header");

var jsFile = [
    "source/js/global.js",
    "source/js/otherFeed.js",
    "source/js/userFeed.js",
    "source/js/userMessage.js",
	"source/js/userFeedType.js",
    "source/js/userInfo.js",
    "source/js/otherFeedType.js",
    "source/js/userFollowFn.js", //关注功能
    "source/js/userFollowList.js",//他人关注列表
	"source/js/picCut.js",
	"source/js/login.js",//登录模块
    "source/js/topSearch.js",//头部搜索功能    
    "source/js/editorPassword.js",//个人中心修改密码模块
    "source/js/userSign.js",//签到
	"source/js/reward.js"
];  //顺序是依赖关系

var cssFile = [
   "source/css/top.css",
    "source/css/otherFeed.css",
    "source/css/gift.css",
    "source/css/userDynamic.css",  //个人中心、他人中心 动态
    "source/css/userFollow.css",//关注列表样式
    "source/css/userInfo.css",    
	"source/css/picCut.css",
    "source/css/userSign.css"
];  //需压缩css文件
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
//合并压缩ueditor===开始
//var jsFile = [
//    "ueditor/umeditor.js"
//];  //顺序是依赖关系
////合并，压缩 parts文件夹中的js文件
//gulp.task('minifyUEjs', function() {
//      gulp.src(jsFile)      //需要操作的文件
//     
//      .pipe(sourcemaps.init())
//      .pipe(rename({ suffix: '.min' }))   //rename压缩后的文件名
//      
//      .pipe(uglify())    //压缩
//      .pipe(header("/*" + versionJs + "*/"))  //注释
//      .pipe(sourcemaps.write('maps'))
//      .pipe(gulp.dest('ueditor'));  //输出
//});

//合并压缩ueditor===结束

//默认命令，在cmd中输入gulp后，执行的就是这个任务(压缩js需要在检查js之后操作)
gulp.task('default',function() {
    gulp.start('minifyjs');
    gulp.start('minifycss');
    //gulp.start('minifyUEjs');  //ueditor压缩
});