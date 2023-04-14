var express = require('express');
var router = express.Router();

const util = require('../utils/common');
const {setNavMenu, setFooter, setLinks, setIndexPic, setHotArticle,setArticle,showArticle} = require("../controller/setData");
const {getLinks} = require("../controller/getData");

router.post('/changeNav', setNavMenu)

router.post('/setFooter', setFooter)

router.post('/setLinks', setLinks)

router.post('/setIndexPic', setIndexPic)

//文章添加修改接口
router.post('/setArticle', setArticle)

//文章发布和删除
router.post('/showArticle', showArticle)
router.post('/setHotArticle', setHotArticle)
module.exports = router;
