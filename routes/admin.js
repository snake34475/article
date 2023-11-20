var express = require("express");
var router = express.Router();

const util = require("../utils/common");
const {
  setNavMenu,
  setFooter,
  setLinks,
  addOneLink,
  editOneLink,
  deleteOneLink,
  setIndexPic,
  setHotArticle,
  setArticle,
  showArticle,
  setArticleType,
  stopLogin,
} = require("../controller/setData");
const { getAllUser } = require("../controller/getData");

router.post("/changeNav", setNavMenu);

router.post("/setFooter", setFooter);

router.post("/setLinks", setLinks);

router.post("/addOneLink", addOneLink);

router.post("/editOneLink", editOneLink);

router.post("/deleteOneLink", deleteOneLink);

router.post("/setIndexPic", setIndexPic);

//文章添加修改接口
router.post("/setArticle", setArticle);

//文章发布和删除
router.post("/showArticle", showArticle);

//展示热门文章
router.post("/setHotArticle", setHotArticle);

//添加修改文章的分类
router.post("/setArticleType", setArticleType);

//获取全部用户列表的api
router.post("/getAllUser", getAllUser);
//添加修改文章的分类

//封停用户
router.get("/stopLogin/:username", stopLogin);

//文章上线
module.exports = router;
