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
var upload = require('./upload/upload');
var creeper = require('./creeper/creeper');
var tdata = require('./transdata/tdata');
var websocket = require("./websocket/socket");

//路由表
var routerMaps = {
//  bigpipe
    "bigpipe": "func:bigpipe",

//  pjax
    "pjax/*.html": "func:pjax",

//  creeper
    "creeper": "func:creeper",

//  upload file
    "upl": "url:upload/upload.html",
    "uindex": "func:u_page",
    "getProgress": "func:u_getProgress",
    "upload": "func:u_upload",

//    websocket
    "ws":"func:socket",
    "wsindex":"url:websocket/client.html",

//    静态资源
    "/public/**/*":"url:"+STATIC_PATH+"**/*",

//  transdata
    "transdata": "url:transdata/request.html",
    "tdata": "func:tdata"
};

var router = Router(routerMaps);
router.set('bigpipe' , bigpipe);
router.set('pjax' , pjax);

router.set('u_page' , upload.page);
router.set('u_getProgress' , upload.getProgress);
router.set('u_upload' , upload.upload);

router.set('creeper' , creeper);
router.set('tdata' , tdata);

router.set('socket' , websocket.handle);

var server = http.createServer(function(req , res){
    router.route(req , res);
}).listen(9030);

websocket.update(server , function(ws){
    ws.on('close' , function(reason){
        console.log("socket closed:"+reason);
    });

    ws.on('message' , function(data){
        websocket.brocast(data);
    });
});

console.log("服务启动成功...");

global.directTo404 = function(res){
    router.error(res);
};
