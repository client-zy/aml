/*
 * GET 用户列表.
 */
exports.list = function(req, res){
  res.send('respond with a resource');
};

/*
 * GET 登录页面.
 */
exports.login = function(req, res, next) {
  res.render('login');
};

/*
 * GET 登出路由.
 */
exports.logout = function(req, res, next) {
  res.redirect('/');
};

/*
 * POST 验证路由.
 */
exports.authenticate = function(req, res, next) {
  //这里加入用户认证逻辑，以控制是否可以进入到管理界面
  res.redirect('/admin');//重定向
};
