/**
 * Created by lijian on 2015/12/28.
 * 聊天模块
 */

/*
 * GET 聊天-登录界面
 */
exports.login = function(req, res){
    //函数res.render(viewName, data, callback(error, html))参数说明如下：（模板，数据，回调）
    res.render('./chat/login');//呈现一个页面给客户端
}