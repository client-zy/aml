var express = require('express'),//导入'Express.js'Web框架
  routes = require('./routes'),//路由
  http = require('http'),//Node.js的http核心模块
  path = require('path'),//用来处理系统路径
  mongoskin = require('mongoskin'),//数据库驱动
  dbUrl = process.env.MONGOHQ_URL || 'mongodb://@localhost:27017/blog',
  db = mongoskin.db(dbUrl, {safe: true}),
  collections = {//数据集合
    articles: db.collection('articles'),
    users: db.collection('users')
  };

var session = require('express-session'),//session
  logger = require('morgan'),//日志
  errorHandler = require('errorhandler'),
  cookieParser = require('cookie-parser'),//解析HTTP请求的cookie数据(req.cookie)
  bodyParser = require('body-parser'),//解析HTTP请求的body数据(req.body)
  methodOverride = require('method-override');

var app = express();//实例化一个对象
app.locals.appTitle = '我的博客';

// 自定义中间件
app.use(function(req, res, next) {
  if (!collections.articles || ! collections.users) return next(new Error("无数据库连接!"))
  req.collections = collections;
  return next();
});

// 配置Express.js
app.set('port', process.env.PORT || 3000);//端口
app.set('views', path.join(__dirname, 'views'));//模板路径
app.set('view engine', 'jade');//模板引擎

// 第三方的模块定义的中间件
app.use(logger('dev'));//会在终端中不停地对每个请求输入日志
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// 只在开发者模式下，触发错误日志
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

// 网页和路由
app.get('/', routes.index);
app.get('/login', routes.user.login);
app.post('/login', routes.user.authenticate);
app.get('/logout', routes.user.logout);
app.get('/admin',  routes.article.admin);
app.get('/post',  routes.article.post);
app.post('/post', routes.article.postArticle);
app.get('/articles/:slug', routes.article.show);

// REST API routes
app.get('/api/articles', routes.article.list);
app.post('/api/articles', routes.article.add);
app.put('/api/articles/:id', routes.article.edit);
app.del('/api/articles/:id', routes.article.del);



app.all('*', function(req, res) {
  res.send(404);
})

// http.createServer(app).listen(app.get('port'), function(){
  // console.log('Express server listening on port ' + app.get('port'));
// });

var server = http.createServer(app);
var boot = function () {
  server.listen(app.get('port'), function(){
    console.info('Express server listening on port ' + app.get('port'));
  });
}
var shutdown = function() {
  server.close();
}
if (require.main === module) {
  boot();
} else {
  console.info('Running app as a module')
  exports.boot = boot;
  exports.shutdown = shutdown;
  exports.port = app.get('port');
}
