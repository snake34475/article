var express = require('express');
var router = express.Router();

const util = require('../utils/common');
const {getNavMenu, getFooter,getLinks,getIndexPic,getHotArticle,getNewArticle,getArticle,getArticleTalk,viewArticle,getArticles} = require("../controller/getData");
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

//获取footer
router.get('/getFooter', function (req, res, next) {
    res.json(util.getReturnData(0, 'success'))
})
//获取头部nav
router.get('/getNavmenu', getNavMenu)

router.get('/getNavFooter', getFooter)

//获取友链
router.get('/getLinks', getLinks)

//获取首页轮播图
router.get('/getIndexPic', getIndexPic)

//获取热点列表内容
router.get('/getHotArticle', getHotArticle)

//获取文章列表内容
router.get('/getNewArticle', getNewArticle)

//获取文章详情
router.get('/getArticle/:id', getArticle)

//获取文章评论
router.get('/getArticleTalk/:id', getArticleTalk)

//分类内容的api开发
router.post('/getArticles', getArticles)
//浏览量自动加一
router.get('/viewArticle/:id', viewArticle)

module.exports = router;

