exports.article = require('./article');
exports.user = require('./user');

/**
 * GET 首页
 */
exports.index = function(req, res, next){
  req.collections.articles.find({published: true}, {sort: {_id:-1}}).toArray(function(error, articles){
    if (error) return next(error);
	//函数res.render(viewName, data, callback(error, html))参数说明如下：（模板，数据，回调）
    res.render('index', { articles: articles});
  })
};



