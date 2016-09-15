"use strict";

const http = require('http');
const fs = require('fs');
const url = require('url');
const crypto = require('crypto');
const path = require('path');
const router = require('./router');

//静态资源目录
global.STATIC_PATH = path.join(__dirname, "../public/");
global.PATH_LINE = __dirname.match(/\/|\\/)[0];

require('./bigpipe/bigpipe');
require('./creeper/creeper');
require('./upload/upload');
require('./pjax/pjax');
require('./transdata/tdata');
require('./crossorigin/cross');

const websocket = require("./websocket/socket");

const server = http.createServer((req, res) => {
  router.route(req, res);
}).listen(9030);

console.log('server listen 9030');

websocket.upgrad(server, (ws) => {
  ws.on('close', (reason) => {
    console.log("socket closed:" + reason);
  });

  ws.on('message', (data) => {
    websocket.brocast(data);
  });
});

global.directTo404 = (res) => {
  router.error(res);
};
