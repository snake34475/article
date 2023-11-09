const crypto = require("crypto");
let redis = require("../utils/redisDB");

const util = require("../utils/common");

exports.userLogin = (req, res) => {
  const { username, password } = req.body;
  redis.get(req.headers.fapp + ":user:info:" + username).then((data) => {
    if (data) {
        if(data.login === 0){
            if (password !== data.password) {

                return res.json(util.getReturnData(1, "账号或密码输入不正确"));
              }else{
                let token = crypto.createHash('md5').update(Date.now() + username).digest("hex")
                let tokenKey = req.headers.fapp + ":user:token:" + token
                delete data.password
                redis.set(tokenKey,data)
                redis.expire(tokenKey,data)
                return res.json(util.getReturnData(0, "登录成功",{
                    token
                }));

              }
        }else{
            return res.json(util.getReturnData(1, "该账号已被封禁，请联系工作人员"));

        }
    
    } else {
      res.json(util.getReturnData(1, "该用户不存在请注册"));
    }
  });
};
//用户注册
exports.userRegister = (req, res, next) => {
  const {
    username,
    password,
    nikename = "未知",
    age = "未知",
    sex = "未知",
    phone = "未知",
  } = req.body;
  let ip = req.ip;
  if (username || password) {
    let key = req.headers.fapp + ":user:info:" + username;
    redis.get(key).then((user) => {
      if (user) {
        res.json(util.getReturnData(1, "用户已存在"));
      } else {
        let userData = {
          username,
          password,
          nikename,
          age,
          sex,
          phone,
          ip,
          login: 0, //用户是否被封停
        };
        redis.set(key, userData);
        res.json(util.getReturnData(0, "注册成功，请登录"));
      }
    });
  } else {
    res.json(util.getReturnData(1, "请输入用户名或者密码"));
  }
};
