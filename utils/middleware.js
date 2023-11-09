//中间件文件,
const util = require('./common')
const {ALLOW_APP} = require('../config/app')
let redis = require('./redisDB')


/**
 * 存放用户状态判定，路由使用须在appjs中注册
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.checkAPP = (req, res, next) => {
    // console.log(req.headers)
    if (!ALLOW_APP.includes(req.headers.fapp)) {
        res.json(util.getReturnData(500, '来源不正确'))
    } else {
        next()
    }
}



exports.checkUser=(req,res,next)=>{
    console.log("校验用户状态")
    if("token" in  req.headers){
        let key = req.headers.fapp + ":user:token:" + req.headers.token
        redis.get(key).then(data=>{
            if(data){
                req.username = data.username
                next()

            }else{
                res.json(util.getReturnData(1,"登录状态已过期"))


            }
        })
    }else{
        res.json(util.getReturnData(403,"请登录"))

    }

}
