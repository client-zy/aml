/**
基于Express.js应用的主文件app.js一般由以下部分组成。
1.引入依赖
2.设置相关配置
3.连接数据库（可选）
4.定义中间件
5.定义路由
6.开启服务
7.在多核系统上启动cluster多核处理模块（可选）
*/

//1.使用require()引入依赖
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

//2.实例化对象（Express.js使用函数模式）
var app = express();//实例化一个对象
app.locals.appTitle = '我的博客';

// 自定义中间件
app.use(function(req, res, next) {
  if (!collections.articles || ! collections.users) return next(new Error("无数据库连接!"))
  req.collections = collections;
  return next();
});

// 3.其中一种配置Express.js设置的方式是使用app.set()，使用键值对的形式
app.set('port', process.env.PORT || 3000);//端口
app.set('views', path.join(__dirname, 'views'));//模板路径
app.set('view engine', 'jade');//模板引擎

/*
4.中间件是Express.js框架中的骨干部分，有两种生成方式：
    4.1.由外部第三方的模块定义：例如：来自Connect/Express.js，body-parser:app.use(bodyParser.json());的bodyParser.json
    4.2.由应用本身或他的模块所定义，例如：app.use(function(req,res,next){...});

中间件是用来组织和复用代码的一种方式，函数中只有三个参数：request、response和next.
*/
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

/*
5.路由一般会放在中间件的后面，但是有些也放在前面，如：错误处理
在Express.js中，定义路由的方式在辅助程序app.VERB(url,fn1,fn2,...,fn)中，
其中fn是用来处理请求的，
url是RegExp中的URL对象
VERB的值如下所示：
    5.1.all：捕获每一个请求（所有方式的）
    5.2.get：捕获GET请求
    5.3.post：捕获POST请求
    5.4.put：捕获PUT请求
    5.5.del：捕获DELETE请求
（del和delete是别名：只要记住在JavaScript/ECMAScript中delete是一个有效的操作，这Node.js中也是一样。该操作会删除对象中的一个属性，例如：delete books.nodeInAction）
app.all('*', function(req, res) {
  res.render('index', {msg: 'Welcome to the Practical Node.js!'})
})

函数res.render(viewName, data, callback(error, html))参数说明如下：（模板，数据，回调）
viewName：带有文件名扩展的模版名或者未设置扩展的模板引擎
data：一个由locals传递的可选对象，例如：在Jade中使用msg，我们需要有{msg:"..."}
callback：一个可选的函数，由错误或者HTML绘制完成后调用

res.render()不在Node.js的核心函数中，而是纯粹的Express.js函数，如果被调用，他会调用res.end()从而结束响应。
即在res.render()函数后面，中间件的链不会进行任何处理。
*/
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

// 匹配所有路由
app.all('*', function(req, res) {
  res.send(404);
})

// http.createServer(app).listen(app.get('port'), function(){
  // console.log('Express server listening on port ' + app.get('port'));
// });

//6.启动服务，由核心的http模块和他的createServer方法组成的。
//这个方法中，系统通过所有的设置和路由传递Express.js中的对象
var server = http.createServer(app);
var boot = function () {
  server.listen(app.get('port'), function(){
    console.info('服务启动，开始监听端口--->' + app.get('port'));
  });
}
var shutdown = function() {
  server.close();
}
if (require.main === module) {
  boot();
} else {
  console.info('以模块形式运行一个app');
  exports.boot = boot;
  exports.shutdown = shutdown;
  exports.port = app.get('port');
}
