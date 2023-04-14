//中间件文件
const utils = require('./common')
const {ALLOW_APP} = require('../config/app')


//存放用户状态判定
exports.checkAPP = (req, res, next) => {
    // console.log(req.headers)
    if (!ALLOW_APP.includes(req.headers.fapp)) {
        res.json(utils.getReturnData(500, '来源不正确'))
    } else {
        next()
    }
}



