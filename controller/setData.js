const crypto = require('crypto')
let redis = require('../utils/redisDB')

const util = require('../utils/common')

exports.setNavMenu = (req, res, next) => {
    let key = req.headers.fapp + ':nav_menu'
    let data = req.body.nav_menu
    console.log(data)
    redis.set(key, data)
    res.json(util.getReturnData(0, '修改成功'))
}
exports.setFooter = (req, res, next) => {
    let key = req.headers.fapp + ':footer'
    let data = req.body.footer
    console.log(data)
    redis.set(key, data)
    res.json(util.getReturnData(0, '修改成功'))
}
exports.setLinks = (req, res, next) => {
    let key = req.headers.fapp + ':links'
    let data = req.body.links
    console.log(data)
    redis.set(key, data)
    res.json(util.getReturnData(0, '修改成功'))
}
exports.setIndexPic = (req, res, next) => {
    let key = req.headers.fapp + ':indexPic'
    let data = req.body.indexPic
    console.log(data)
    redis.set(key, data)
    res.json(util.getReturnData(0, '修改成功'))
}
exports.setHotArticle = (req, res, next) => {
    let key = req.headers.fapp + ':hotArticle'
    let data = req.body.hotArticle
    console.log(data)
    redis.set(key, data)
    res.json(util.getReturnData(0, '修改成功'))
}
// //添加文章
//新增或者修改
//新增tag集合和type集合存储文章
//新增点赞数量，观看数量，和时间戳
exports.setArticle = (req, res, next) => {
    let data = req.body.article
    let fapp = req.headers.fapp
    //任何修改或新上线的文章都不显示
    data.show = 0
    let key = ''

    if ('a_id' in data) {
        //设置key
        key = fapp + ':article:' + data.a_id
        redis.set(key, data)
        res.json(util.getReturnData(0, '修改成功'))
    } else {
        //新文章初始化 点赞数 观看数 时间戳
        data.time = Date.now()
        key = fapp + ':article:'
        //获取自增id
        redis.incr(key).then((id) => {
            data.a_id = id
            key = key + id

            redis.set(key, data)

            let a_type = data.type

            //获取类型
            redis.get(fapp + ':a_type:' + a_type).then((datal) => {
                //没有类型就新造空类型
                if (!datal) {
                    datal = []
                }
                //将key添加到数据中
                datal.push(key)
                redis.set(fapp + ':a_type:' + a_type, datal)
            })
            let tags = data.tag
            tags.map(item => {
                let tKeyMd5 = crypto.createHash('md5').update(item).digest('hex')
                redis.get(fapp + ':tag:' + tKeyMd5).then(datal => {
                    if (!datal) {
                        datal = []
                    }
                    datal.push(key)
                    redis.set(fapp + ':tag:' + tKeyMd5, datal)
                })
            })
            //添到有序集合中，时间为当前的时间，浏览量和喜欢默认设置为0
            //fapp命中哪个key，key要存在key，第三个值是当前的分值
            redis.zadd(fapp + ':a_time', key, Date.now())
            redis.zadd(fapp + ':a_view', key, 0)
            redis.zadd(fapp + ':a_like', key, 0)

            res.json(util.getReturnData(0, '新建文章成功'))
        })
    }
}
//修改文章展示
exports.showArticle = (req, res, next) => {
    let key = req.headers.fapp + ':article:' + req.body.a_id
    redis.get(key).then((data) => {
        if (!data) return res.json(util.getReturnData(404, '没有此文章'))
        if (data.show == 1) {
            data.show = 0
        } else {
            data.show = 1
        }
        redis.set(key, data)
        res.json(util.getReturnData(0, '文章修改成功'))
    })
}
//添加修改文章的分类
exports.setArticleType = (req, res) => {
    let fapp = req.headers.fapp
    let types = req.body.type //这个也是数组对象结构 [[]]
    let key = fapp + ':a_type' 
    //存储所有的分类，并让默认值为空对象
    //TODO：有问题，之前已经被进行分类的文章没有进行操作
    redis.set(key, types)
    types.map(item => {
        let tKey = fapp + ':a_type' + item.uid
        redis.get(tKey).then(data1 => {
            if (!data1) {
                redis.set(tKey, {})//其实这个应该设置成[]应该也行
            }
        })
    })
    res.json(util.getReturnData(0,'创建分类成功'))
}

//封停用户
exports.stopLogin=(req, res) => {
    let key = req.headers.fapp+':user:info'+req.params.id
    redis.get(key).then(user=>{
        if(!user) return  res.json(util.getReturnData(1,'该用户不存在'))
        if(user.login==0){
            user.login=1
        }else{
            user.login=0
        }
        redis.set(key,user)
        res.json(util.getReturnData(0,'用户修改成功'))
    })
}
