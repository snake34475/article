let redis = require('redis')
//获取数据库的配置
const {redisConfig} = require('../config/db')

// 获取redis连接
const redis_client = redis.createClient(redisConfig)

//连接数据库
redis_client.on('connect', () => {
    console.log("连接成功")
})

//连接异常
redis_client.on('error', (err) => {
    console.log(err)
})

//声明redis
redis = {}

//根据模式获取全部键
keys = async (cursor, re, count) => {
    let getTempKeys = await new Promise((resolve) => {
        redis_client.scan([cursor, 'MATCH', re, 'COUNT', count], (err, res) => {
            console.log(err)
            return resolve(res)
        })
    })
    return getTempKeys
}

redis.scan = async (re, cursor = 0, count = 100) => {
    return await keys(cursor, re, count)
}


//将值写入数据库
redis.set = (key, value) => {

    //将所有对象转化成json保存
    //字符串过大，可能导致性能下降
    value = JSON.stringify(value)
    return redis_client.set(key, value, (err) => {
        if (err) {
            console.log(err)
        }
    })
}

//获取text 获取时，可使用then调用
text = async (key) => {
    let getTempValue = await new Promise((resolve) => {
        redis_client.get(key, (err, res) => {
            return resolve(res)
        })
    })

    getTempValue = JSON.parse(getTempValue) //是async会因事返回promise，所以此处还是原类型
    return getTempValue 
}

redis.get = async (key) => {
    return await text(key)//因为async会隐式返回一个promise，因此需要使用asyncs
}

//设置key过期时间
redis.expire = (key, ttl) => {
    //设置超时，时间到期立马删除
    redis_client.expire(key, parseInt(ttl))
}

//获取自增id
id = async (key) => {
    let id = await new Promise((resolve) => {
        //这就是个自增方法，让key的值+1
        redis_client.incr(key, (err, res) => {
            console.log(res)
            return resolve(res)
        })
    })
    console.log(id)
    return id
}
redis.incr = async (key) => {
    return await id(key)
}

//有序集合
//新增有序集合（键名，成员，分值）
redis.zadd = (key, member, num) => {
    member = JSON.stringify(member)
    redis_client.zadd(key, num, member, (err) => {
        if (err) {
            console.log(err)
        }
    })
}

//获取一定范围内的元素

tempData = async (key, min, max) => {
    let tData = await new Promise((resolve) => {
        //不添加WITHSCORES的话不会返回这些成员的分支，只会返回成员
        redis_client.zrevrange([key, min, max, "WITHSCORES"], (err, res) => {
            return resolve(res)
        })
    })
    //获取分值，但是要转换成对象
    let oData = []
    //构造
    /*
    //为什么要插入i的下一个呢,因为zreverage是这样吐出数据的
    1) "member1"
   2) "10"
   3) "member2"
   4) "20"
   5) "member3"
   6) "30"
   7) "member4"
   8) "40"
   9) "member5"
  10) "50"

     */
    console.log('执循环钱行',tData.length)
    for (let i = 0; i < tData.length; i += 2) {
        //返回的对象是member就是key值，score就是他的value\
        // console.log("tData",tData[i])
        oData.push({member: JSON.parse(tData[i]), score: tData[i + 1]})
        // console.log("tData")
    }
    console.log("goodss")
    return oData
}

redis.zrevrange = async (key, min = 0, max = -1) => {
    return await tempData(key, min, max)
}

//有序集合的自增操作

redis.zincrby = async (key, member, NUM = 1) => {
    member = JSON.stringify(member)
    return await new Promise(resolve=>{
        redis_client.zincrby(key, NUM, member, (err) => {
            if (err) console.log(err)
            resolve()
        })
    })
    
    
   
}

//有序集合通过member获取score值
tempZscore = async (key, member) => {
    member = JSON.stringify(member)
    return await new Promise((resolve) => {
        redis_client.zscore(key, member, (err, res) => {
            console.log(res)
            return resolve(res)
        })
    })
}

redis.zscore = async (key, member) => {
    return await tempZscore(key, member)
}

module.exports = redis
