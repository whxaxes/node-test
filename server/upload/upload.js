/*
 *PC端文件上传功能
 */
'use strict';

var http = require('http');
var fs = require('fs');
var crypto = require('crypto');
var del = require('del');
var router = require('../router');
var path = require('path');

var sessionMaps = {};

require('./upload_2');

router.setMap({
  upl: path.join(__dirname, 'upload.html'),
  uindex: page,
  getProgress: getProgress,
  upload: upload,
});

//获取上传进度信息
function getProgress(req, res) {
  var sessionMap = sessionMaps[getSymbol(req)] || {};

  res.end('{"now":"' + sessionMap.now + '" , "size":"' + sessionMap.size + '" , "speed":"' + sessionMap.speed + '"}');
}

//前往页面
function page(req, res) {
  var symbol = getSymbol(req);

  if (!(symbol in sessionMaps)) {
    sessionMaps[symbol] = {
      now: 0,
      speed: 0,
      size: 0,
      file: '',
    };
  }

  router.routeTo(req, res, path.join(__dirname, './index.html'), {
    'Set-Cookie': 'upload_id=' + symbol,
  });
}

//解析cookie
function parseCookie(cookie) {
  var cookieObj = {};

  if (typeof cookie == 'string') {
    var array = cookie.split(';');
    array.forEach(function(a, i) {
      var sa = a.split('=', 2);
      cookieObj[sa[0].trim()] = sa[1].trim();
    });
  }

  return cookieObj;
}

//获取标记
function getSymbol(req) {
  var cookie = parseCookie(req.headers['cookie']);
  return cookie['upload_id'] || ~~(Math.random() * 100000000);
}

//上传接口
function upload(req, res) {
  var imgsays = [],
    num = 0,
    isStart = false;

  var ws, filename, filepath;
  var sessionMap = sessionMaps[getSymbol(req)] || {};

  try {
    fs.statSync(path.join(STATIC_PATH, '/upload'));
  } catch (e) {
    fs.mkdirSync(path.join(STATIC_PATH, '/upload'));
  }

  //文件大小
  var fileSize = req.headers['content-length'];
  // var maxSize = 5;
  // if ((fileSize / 1024 / 1024) > maxSize) {
  //   res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
  //   res.end('<div id="reason">上传的文件不能大于' + maxSize + 'M</div>');
  //   return;
  // }

  var time = new Date();
  sessionMap.size = fileSize;

  req.on('data', function(chunk) {
    var start = 0;
    var end = chunk.length;
    var rems = [];

    sessionMap.now += chunk.length;

    var ntime = new Date();
    var speed = ~~(chunk.length / 1024 / ((ntime - time) / 1000) + 0.5);
    if (speed > 0) {
      if (speed <= 1024) {
        sessionMap.speed = speed + 'KB/S';
      } else {
        speed = ~~(speed / 1024);
        sessionMap.speed = speed + 'MB/S';
      }
    }
    time = ntime;

    for (var i = 0; i < chunk.length; i++) {
      if (chunk[i] == 13 && chunk[i + 1] == 10) {
        num++;
        rems.push(i);

        if (num == 4) {
          start = i + 2;
          isStart = true;

          var str = new Buffer(imgsays).toString();
          filename = str.match(/filename=".*"/g)[0].split('"')[1];
          filepath = path.join(STATIC_PATH, 'upload/' + filename);
          ws = fs.createWriteStream(filepath);
        } else if (i == chunk.length - 2) {
          //说明到了数据尾部的\r\n
          end = rems[rems.length - 2];
          break;
        }
      }

      if (num < 4) {
        imgsays.push(chunk[i]);
      }
    }

    if (isStart) {
      ws.write(chunk.slice(start, end));
    }
  });

  req.on('end', function() {
    ws.end();
    console.log('保存' + filename + '成功');
    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
    res.end('<div id="path">/public/upload/' + filename + '</div>');

    // 防止他人上传大量图片，每次上传一次图片将此前上传的删除
    if (fs.existsSync(sessionMap.file)) {
      console.log('删除' + sessionMap.file);
      fs.unlinkSync(sessionMap.file);
    }

    // 同时设个定时器，所有图片一分钟后如果还存在则删除
    setTimeout(function() {
      if (fs.existsSync(path.join(STATIC_PATH, 'upload/' + filename))) {
        console.log('删除' + filename);
        fs.unlinkSync(path.join(STATIC_PATH, 'upload/' + filename));
      }
    }, 60 * 1000);

    sessionMap.file = path.join(STATIC_PATH, 'upload/' + filename);
    sessionMap.speed = 0;
    sessionMap.size = 0;
    sessionMap.now = 0;
  });
}
