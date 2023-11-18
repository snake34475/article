let redis = require("../utils/redisDB");

const util = require("../utils/common");

//发表评论
exports.articleTalk = (req, res, next) => {
  if ("a_id" in req.body && "talk" in req.body) {
    let talk = {
      username: req.username,
      time: Date.now(),
      talk: req.body.talk,
    };
    let key = req.headers.fapp + ":article:" + req.body.a_id + ":talk";
    redis.get(key).then((data) => {
      let tData = [];
      if (data) {
        tData = data;
      }
      tData.push(talk);
      redis.set(key, tData);
      res.json(util.getReturnData(0, "评论成功"));
    });
  } else {
    res.json(util.getReturnData(1, "评论参数错误"));
  }
};
//用户资料
exports.getUserInfo = (req, res, next) => {
  redis
    .get(req.headers.fapp + ":user:info:" + req.params.username)
    .then((data) => {
      if (data) {
        if (data.username === req.username) {
          delete data.password;
        } else {
          delete data.password;
          delete data.phone;
        }
        data.role = []
        res.json(util.getReturnData(0, "", data));
      } else {
        res.json(util.getReturnData(1, "用户不存在"));
      }
    });
};

//修改用户资料
exports.changeUserInfo = (req, res, next) => {
  const { password, nikename, age, sex, phone } = req.body;
  let key = req.headers.fapp + ":user:info:" + req.username;
  redis.get(key).then((data) => {
    if (data) {
      let userData = {
        username: req.username,
        password: password || data.password,
        nikename: nikename || data.nikename,
        age: age || data.age,
        sex: sex || data.sex,
        phone: phone || data.phone,
        login: data.login,
      };
      redis.set(key, userData);
      res.json(util.getReturnData(0, "修改成功"));
    } else {
      res.json(util.getReturnData(1, "用户不存在"));
    }
  });
};

//发送私信
exports.sendMail = (req, res, next) => {
  const fapp = req.headers.fapp;
  const { username: username2, text } = req.body;
  const userKey = fapp + ":user:info:" + username2; //账户
  redis.get(userKey).then((user) => {
    if (user && text) {
      let userKey1 = fapp + ":user:" + req.username + ":mail";
      let userKey2 = fapp + ":user:" + username2 + ":mail";
      let mailKey = fapp + ":mail:";
      // redis.set(userKey2,null)
      // redis.set(userKey1,null)
      // redis.set(mailKey,null)

      // return res.json(util.getReturnData(0, "发送私信成功"));
      redis.get(userKey1).then((mail) => {
        if (!mail) mail = [];
        let has = false;
        //如果是上次对话

        console.log("mail", mail);
        for (let i = 0; i < mail.length; i++) {
          console.log(
            "mail[i].users:",
            mail[i].users,
            ",username2:",
            username2
          );
          if (mail[i].users.indexOf(username2) !== -1) {
            has = true;
            mailKey = mailKey + mail[i].m_id;
            redis.get(mailKey).then((allArr) => {
              // if(!allArr) allArr = []
              console.log("arr", allArr);
              allArr.push({ text, time: Date.now(), read: [] });
              redis.set(mailKey, allArr);
              // console.log("userKey1",userKey1);
              res.json(util.getReturnData(0, "发送私信成功"));
            });
          }
        }

        //如果是新建对话

        if (!has) {
          console.log("执行新建");
          redis.incr(mailKey).then((m_id) => {
            mailKey = mailKey + m_id;
            redis.set(mailKey, [{ text, time: Date.now(), read: [] }]);

            mail.push({ m_id, users: [req.username, username2] });
            redis.set(userKey1, mail);

            redis.get(userKey2).then((mail2) => {
              if (!mail2) mail2 = [];

              mail2.push({ m_id, users: [req.username, username2] });
              redis.set(userKey2, mail2);
              res.json(util.getReturnData(0, "发送私信成功"));
            });
          });
        }
      });
    }
  });
};

//获取私信列表
exports.getMails = (req, res, next) => {
  let userKey1 = req.headers.fapp + ":user:" + req.username + ":mail";
  redis.get(userKey1).then((mail) => {
    res.json(util.getReturnData(0, "", mail));
  });
};
//获取私信详情
exports.getUserMail = (req, res, next) => {
  let userKey1 = req.headers.fapp + ":user:" + req.username + ":mail";
  let rData = {};
  let u_id = req.params.u_id;
  redis.get(userKey1).then((mail) => {
    if (!mail) return res.json(util.getReturnData(0, "没有收到私信"));
    //判断否能找到
    let has = false;
    mail.forEach((item) => {
      if (item.u_id === u_id) {
        has = true;
        //删除自己的名称
        item.users.splice(item.users.indexOf(req.username));
        rData.toUser = item.users[0]; //收信人
        let mailKey = req.headers.fapp + ":mail:" + u_id;
        redis.get(mailKey).then((arr) => {
          if (!arr) return res.json(util.getReturnData(1, "没有收到私信"));
          console.log("data", arr);
          if (arr[arr.length - 1].read.indexOf(req.username) < 0) {
            arr[arr.length - 1].read.push(req.username);
          }
          rData.mail = arr;
          redis.set(mailKey, arr);
          res.json(util.getReturnData(0, "获取私信成功", arr));
        });
      }
    });
    if (!has) {
      return res.json(util.getReturnData(1, "没有收到私信"));
    }
  });
};

//点赞
exports.articleLike = (req, res, next) => {
  let member = req.headers.fapp + ":article:" + req.params.id;
  let key = req.headers.fapp + ":a_like";

  let like = req.params.like;

  if (like === 0) {
    redis.zincrby(key, member, -1);
  } else {
    redis.zincrby(key, member);
  }
  res.json(util.getReturnData(0, "success"));
};

//收藏文章
exports.articleCollection = (req, res, next) => {
  let key = req.headers.fapp + ":user:" + req.username + ":collection";
  let a_key = req.headers.fapp + ":article:" + req.params.id;

  redis.get(a_key).then((article) => {
    if (!article) return res.json(util.getReturnData(1, "文章不存在"));
    redis.get(key).then((data) => {
      if (!data) data = [];

      data.push({ time: new Date(), title: article.title, a_id: article.a_id });

      redis.set(key, data);

      res.json(util.getReturnData(0, "success"));
    });
  });
};

//获取收藏文章
exports.getCollection = (req, res, next) => {
  let key = req.headers.fapp + ":user:" + req.username + ":collection";
  redis.get(key).then((data) => {
    res.json(util.getReturnData(0, "success",data));
  });
};

