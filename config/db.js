//redis基本配置页面
exports.redisConfig = {
  host: 'localhost',
//   host: "114.115.142.205",
  port: "6379",
  ttl: 5 * 60 * 1000, //缓存键过期时间，设置为五分钟
};
