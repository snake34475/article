const crypto = require('crypto')
let redis = require('../utils/redisDB')

const util = require('../utils/common')
const {getHotArticle} = require("./getData");

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
//添加文章
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
