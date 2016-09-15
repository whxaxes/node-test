/**
 * Created by wanghx on 9/15/16.
 */

'use strict';

const Router = require('easy-router');
const path = require('path');
const routerMaps = {
  "/public/**/*": './public/**/*'       //静态资源
};

module.exports = Router({
  root: path.join(__dirname, '../'),    // 项目根目录
  maps: routerMaps,                     // 初始的路由表
  useZlib: true,                        // 使用gzip压缩
  useCache: true,                       // 使用http缓存, 默认为false
  maxCacheSize: 1                       // 凡是小于maxCacheSize的资源将以文件内容的md5值作为Etag，单位为MB
});