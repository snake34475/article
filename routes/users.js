//不验证登录情况，用于注册和登录
var express = require('express');
var router = express.Router();
var {userLogin,userRegister}=require('../controller/user')
var {checkUser} =require('../utils/middleware')
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post("/login",userLogin)

router.post('/register',userRegister)

router.use("/user",checkUser,require("./userNeedCheck"))
// router.post('/user',checkUser,require("./userNeedCheck.js"))
module.exports = router;
