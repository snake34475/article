//通用的方法和验证内容

let util = {}

/**
 * 获取默认返回值函数
 * @param {*} code 
 * @param {*} message 
 * @param {*} data 默认为[]
 * @returns 
 */
util.getReturnData = (code, message = '', data = []) => {
    if (!data) {
        data = []
    }
    return {code: code, message: message, data: data}
}

/**
 *  格式化时间
 * @param {*} t 
 * @returns 
 */
util.getLocalDate = (t) => {
    let date = new Date(parseInt(t))
    return date.getFullYear() + "-" + (parseInt(date.getMonth()) + 1) + "-"
        + date.getDate() + " " + date.getHours() + ':' + date.getMinutes() + ':'
        + date.getSeconds();
}
module.exports = util
