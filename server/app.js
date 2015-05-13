"use strict";

var http = require('http');
var fs = require('fs');
var url = require('url');
var crypto = require('crypto');
var Router = require('easy-router');

//静态资源目录
global.STATIC_PATH = "../public/";
global.PATH_LINE = __dirname.match(/\/|\\/)[0];

var bigpipe = require('./bigpipe/bigpipe');
var pjax = require('./pjax/pjax');
var getProgress = require('./upload/upload').getProgress;
var upload = require('./upload/upload').upload;
var creeper = require('./creeper/creeper');
var tdata = require('./transdata/tdata');

//路由表
var routerMaps = {
//  bigpipe
    "bigpipe": "func:bigpipe",

//  pjax
    "pjax/*.html": "func:pjax",

//  creeper
    "creeper": "func:creeper",

//  upload file
    "uindex": "url:upload/index.html",
    "upl": "url:upload/upload.html",
    "getProgress": "func:getProgress",
    "upload": "func:upload",

//    静态资源
    "/public/**/*":"url:"+STATIC_PATH+"**/*",

//  transdata
    "transdata": "url:transdata/request.html",
    "tdata": "func:tdata"
}

var router = Router(routerMaps);
router.set('bigpipe' , bigpipe);
router.set('pjax' , pjax);
router.set('getProgress' , getProgress);
router.set('upload' , upload);
router.set('creeper' , creeper);
router.set('tdata' , tdata);

http.createServer(function(req , res){
    router.route(req , res);
}).listen(9030);

console.log("服务启动成功...");

global.directTo404 = function(res){
    router.error(res);
};
