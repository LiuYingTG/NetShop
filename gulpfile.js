var gulp = require('gulp');
var less = require('gulp-less');
var cssmin = require('gulp-cssmin');
var autoprefixer = require('gulp-autoprefixer');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var htmlmin = require('gulp-htmlmin');
var gulpif = require('gulp-if');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');//清空文件夹
var gulpRemoveHtml = require('gulp-remove-html');//标签清除，参考：https://www.npmjs.com/package/gulp-remove-html
var removeEmptyLines = require('gulp-remove-empty-lines');//清除空白行，参考：https://www.npmjs.com/package/gulp-remove-empty-lines
/*1、css文件处理
*   （1）less-css
*   （2）css前缀
*   （3）css压缩
*   （4）生成编号版本+json文件*/
gulp.task('clean',function(){
    gulp.src('./release/**',{read:false})
        .pipe(clean());
});
gulp.task('less', function () {
    gulp.src('./static/less/*.less')
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['cover 99.5%'],
            cascade: false
        }))
        .pipe(cssmin())
        .pipe(rev())
        .pipe(gulp.dest('./release/static/css'))
        .pipe(rev.manifest())
        .pipe(rename('rev-css.json'))
        .pipe(gulp.dest('./release/rev'))
});
/*2、image处理
*   （1）压缩
*   （2）生成编号
* */
gulp.task('imagemin',function () {
    gulp.src(['./static/images/*', './uploads/*'], {base: './'})
    .pipe(imagemin())
    .pipe(gulp.dest('./release'))
});
/*3、js处理
*   （1）压缩
*   （2）生成编号
* */
gulp.task('useref', function () {
    gulp.src('./index.html')
    .pipe(useref())
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.js', rev()))
    .pipe(gulp.dest('./release'))
    .pipe(rev.manifest())
    .pipe(rename('rev-js.json'))
    .pipe(gulp.dest('./release/rev'));
});
//html压缩
gulp.task('html',function(){
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
    gulp.src(['./templates/*.html'],{base:'./'})
        .pipe(gulpRemoveHtml())//清除特定标签
        .pipe(removeEmptyLines({removeComments: true}))//清除空白行
        .pipe(htmlmin(options))
        .pipe(gulp.dest('./release'));
});


/*4、其他，不需要操作，迁移*/
gulp.task('other', function () {
    gulp.src(['./static/fonts/*', './static/libs/*', './favicon.ico'], {base: './'})
        .pipe(gulp.dest('./release'));
});
/*5、修改HTML中的引入
*   这一项工作必须在上述项目之后才能完成，所以形成依赖关系
* */
gulp.task('rev', ['less', 'imagemin', 'useref','html'], function () {
    gulp.src(['./release/rev/*.json' , './release/index.html'] )
        .pipe(revCollector({
            replaceReved: true
        }))
        .pipe(gulp.dest('./release'));
});
gulp.task('revHtml',function () {
    gulp.src(['./release/rev/*.json' , './release/templater/*.html'])
        .pipe(revCollector({
            replaceReved: true
        }))
        .pipe(gulp.dest('./release/templater'));
});
gulp.task('default',function () {
    gulp.start('rev', 'other');
})
connect = require('gulp-connect');
//建立一个配置对象变量，后面我们要传递给插件用来启动server
var serverConfig = {
    root: 'release',//从哪个目录开启server
    // host:'0.0.0.0',
    port: 8088//将服务开启在哪个端口
}
//建立一个server任务 直接可以用 gulp server就可以执行这个任务
gulp.task('server', function () {
    connect.server(serverConfig);
});

