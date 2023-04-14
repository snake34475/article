let redis = require('../utils/redisDB')

const util = require('../utils/common')

exports.getNavMenu = (req, res, next) => {

    let key = req.headers.fapp + ':nav_menu'
    redis.get(key).then(data => {
        res.json(util.getReturnData(0, '', data))
    })
}
exports.getFooter = (req, res, next) => {

    let key = req.headers.fapp + ':footer'
    redis.get(key).then(data => {
        res.json(util.getReturnData(0, '', data))
    })
}

exports.getLinks = (req, res, next) => {

    let key = req.headers.fapp + ':links'
    redis.get(key).then(data => {
        res.json(util.getReturnData(0, '', data))
    })
}

exports.getIndexPic = (req, res, next) => {

    let key = req.headers.fapp + ':indexPic'
    redis.get(key).then(data => {
        res.json(util.getReturnData(0, '', data))
    })
}
//获取文章热点
exports.getHotArticle = (req, res, next) => {
    let key = req.headers.fapp + ':a_view' //该列表按照时间戳保存文章key
    //只选取01234这五条数据
    redis.zrevrange(key, 0, 4).then(async (data) => {
        console.log(data)
        let result = data.map((item) => {
            //获取每篇文章的题目 id 日期
            return redis.get(item.member).then((datal) => {
                console.log(datal)
                //如果是可以展示的
                if (datal && datal.show != 0) {
                    return {
                        'title': datal.title,
                        'date': util.getLocalDate(datal.time),
                        'id': datal.a_id,
                        'view': item.score
                    }
                } else {
                    return {'title': '文章暂未上线', "data": '', 'id': 0}
                }
            })
        })
        //处理异步问题，当所有的相应到达了，就结束
        let t_data = await Promise.all(result)
        res.json(util.getReturnData(0, "", t_data))
    })
}
exports.getNewArticle = (req, res, next) => {

    //根据时间有序查找
    let key = req.headers.fapp + ':a_time'
    //查找几个
    redis.zrevrange(key, 0, -1).then(async data => {
        const result = data.map(item => {
            //获取根据id获取数据
            return redis.get(item.member).then(data1 => {
                if (data1 && data1.show != 0) {
                    return {
                        'title': data1.title,
                        "date": util.getLocalDate(item.score),
                        "id": data1.a_id
                    }
                } else {
                    return {
                        "title": '文章暂未上线',
                        "date": '',
                        "id": ''
                    }
                }
            })
        })
        let t_Data = await Promise.all(result)
        res.json(util.getReturnData(0, '', t_Data))
    })
}
exports.getArticle = (req, res, next) => {


    let key = req.headers.fapp + ':article:' + req.params.id

    redis.get(key).then(data => {
        if (data) {
            if (data.show == 1) {

            } else {
                res.json(util.getReturnData(403, '该文章还在审核中'))
            }
        } else {
            res.json(util.getReturnData(404, '该文章已被删除或者不存在'))
        }

    })
}

