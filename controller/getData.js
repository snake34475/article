let redis = require("../utils/redisDB");

const util = require("../utils/common");
const crypto = require("crypto");
exports.getNavMenu = (req, res, next) => {
  let key = req.headers.fapp + ":nav_menu";
  redis.get(key).then((data) => {
    res.json(util.getReturnData(0, "", data));
  });
};
exports.getFooter = (req, res, next) => {
  let key = req.headers.fapp + ":footer";
  redis.get(key).then((data) => {
    res.json(util.getReturnData(0, "", data));
  });
};

exports.getLinks = (req, res, next) => {
  let key = req.headers.fapp + ":links";
  redis.get(key).then((data) => {
    res.json(util.getReturnData(0, "", data));
  });
};

exports.getIndexPic = (req, res, next) => {
  let key = req.headers.fapp + ":indexPic";
  redis.get(key).then((data) => {
    res.json(util.getReturnData(0, "", data));
  });
};
//获取文章热点
exports.getHotArticle = (req, res, next) => {
  let key = req.headers.fapp + ":a_view"; //该列表按照时间戳保存文章key
  //只选取01234这五条数据
  redis.zrevrange(key, 0, 4).then(async (data) => {
    console.log(data);
    let result = data.map((item) => {
      //获取每篇文章的题目 id 日期
      return redis.get(item.member).then((datal) => {
        console.log(datal);
        //如果是可以展示的
        if (datal && datal.show != 0) {
          return {
            title: datal.title,
            date: util.getLocalDate(datal.time),
            id: datal.a_id,
            view: item.score,
          };
        } else {
          return { title: "文章暂未上线", data: "", id: 0 };
        }
      });
    });
    //处理异步问题，当所有的相应到达了，就结束
    let t_data = await Promise.all(result);
    res.json(util.getReturnData(0, "", t_data));
  });
};
exports.getNewArticle = (req, res, next) => {
  //根据时间有序查找
  let key = req.headers.fapp + ":a_time";

  if ("token" in req.headers) {
    let pKey = req.headers.fapp + ":user:power:" + req.headers.token;
    redis.get(pKey).then((power) => {
      if (power == "admin") {
        redis.zrevrange(key, 0, -1).then(async (data) => {
          const result = data.map((item) => {
            //获取根据id获取数据
            // console.log("查找中")
            return redis.get(item.member).then((data1) => {
              return {
                title: data1.title,
                date: util.getLocalDate(item.score),
                id: data1.a_id,
              };
            });
          

          });
          let t_data = await Promise.all(result)
         return res.json(util.getReturnData(0,"",t_data))
        });
      }
    });
  }
  //查找几个
  redis.zrevrange(key, 0, -1).then(async (data) => {
    // console.log("查找中")
    const result = data.map((item) => {
      //获取根据id获取数据
      // console.log("查找中")
      return redis.get(item.member).then((data1) => {
        if (data1 && data1.show != 0) {
          return {
            title: data1.title,
            date: util.getLocalDate(item.score),
            id: data1.a_id,
          };
        } else {
          return {
            title: "文章暂未上线",
            date: "",
            id: "",
          };
        }
      });
    });
    let t_Data = await Promise.all(result);
    res.json(util.getReturnData(0, "", t_Data));
  });
};
exports.getArticle = (req, res, next) => {
  let key = req.headers.fapp + ":article:" + req.params.id;
  let fapp = req.headers.fapp;
  redis.get(key).then((data) => {
    if (data) {
      if (data.show == 1) {
        //为什么要做这一步，似乎是type列表中的列表循环，让他的name等于typename，但是没有a_type列表，后续可以看一下
        redis.get(req.headers.fapp + ":a_type").then((type) => {
          console.log("type", type);
          type &&
            type.map((item) => {
              if (item.uid == data.type) {
                data.typename = item.name;
              }
            });
          //获取文章的访问量
          redis.zscore(fapp + ":a_view", key).then((view) => {
            data.view = view;
            //获取文章的点赞量
            redis.zscore(fapp + ":a_like", key).then((like) => {
              data.like = like;
              res.json(util.getReturnData(0, "success", data));
            });
          });
        });
      } else {
        res.json(util.getReturnData(403, "该文章还在审核中"));
      }
    } else {
      res.json(util.getReturnData(404, "该文章已被删除或者不存在"));
    }
  });
};

exports.getArticleTalk = (req, res) => {
  let fapp = req.headers.fapp;
  let key = fapp + ":article:" + req.params.id + ":talk";
  redis.get(key).then((data) => {
    res.json(util.getReturnData("0", "success", data));
  });
};

exports.viewArticle = (req, res) => {
  let fapp = req.headers.fapp;
  let key = fapp + ":article:" + req.params.id;
  console.log("key", key);
  redis.zincrby(fapp + ":a_view", key).then((data) => {
    res.json(util.getReturnData("0", "success"));
  });
};

//获取type或者tag下的文章简介
exports.getArticles = (req, res) => {
  let key = req.headers.fapp;

  if ("tag" in req.body) {
    let tKeyMd5 = crypto.createHash("md5").update(req.body.tag).digest("hex");
    key = key + ":tag:" + tKeyMd5;
    console.log("key", key);
  } else if ("type" in req.body) {
    key = key + ":a_type:" + req.body.type;
    console.log("key", key);
  } else {
    res.json(util.getReturnData(1, "数据参数错误"));
    return;
  }
  redis.get(key).then(async (data) => {
    if (!data) return res.json(util.getReturnData(1, "请求的参数不存在"));
    let result = data.map((item) => {
      return redis.get(item).then((data1) => {
        if (data1 && data1.show != 0) {
          return {
            title: data1.title,
            date: util.getLocalDate(data1.time),
            id: data1.a_id,
          };
        } else {
          return {
            title: "文章暂未上线",
            date: "",
            id: "",
          };
        }
      });
    });
    let t_data = await Promise.all(result);
    res.json(util.getReturnData(0, "", t_data));
  });
};
exports.getAllUser = (req, res) => {
  let re = req.headers.fapp + ":user:info:*";
  //传入scan游标和个数
  redis.scan(re).then(async (data) => {
    //下标为0返回的元素是游标，1返回的是给定模式键的数组
    let result = data[1].map((item) => {
      return redis.get(item).then((user) => {
        return {
          username: user.username,
          login: user.login,
          ip: user.ip,
        };
      });
    });
    let t_data = await Promise.all(result);
    res.json(util.getReturnData(0, "success", t_data));
  });
};
