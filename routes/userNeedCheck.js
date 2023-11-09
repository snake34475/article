var express = require('express');
var router = express.Router();

const util = require('../utils/common');
const { articleTalk, getUserInfo, changeUserInfo, sendMail, getMails, getUserMail, articleLike, articleCollection,getCollection } = require('../controller/userNeedCheck');

router.post('/article/talk', articleTalk)

router.get('/info/:username', getUserInfo)

router.post('/changeInfo', changeUserInfo)

router.post('/sendMail', sendMail)

router.get('/getMails', getMails)


router.get('/mailGet/:id', getUserMail)

router.get("/like/:id/:like",articleLike)

router.get("/save/:id",articleCollection)

router.get("/saveList",getCollection)

//文章上线
module.exports = router;
