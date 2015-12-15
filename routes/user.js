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
  res.redirect('/admin');
};
