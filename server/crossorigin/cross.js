"use strict";

var router = require('../router');
var querystring = require('querystring');

router.setMap({
  '/cross/jsonp': jsonp,
  '/cross/origin': origin
});

function jsonp(req, res) {
  var params = req.params;

  var data = [];
  for (var k in params) {
    if (k !== "callback") {
      data.push(k + ":" + params[k]);
    }
  }

  res.writeHead(200, {
    'Content-Type': 'application/javascript'
  });
  res.end((params.callback || "console.log") + "('jsonp:" + data.join(",") + "')");
}

function origin(req, res) {
  var origin = req.headers['origin'];

  //    只允许本地url测试用
  if (origin !== "null" && !/^http\:\/\/localhost(?:\:\d+)?/.test(origin)) {
    res.end();
  }

  res.writeHead(200, {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin'
  });

  if (req.headers['Access-Control-Allow-Headers']) {
    res.end();
    return;
  }

  var data = "";
  req.setEncoding = 'utf-8';

  req.on('data', function(chunk) {
    data += chunk;
  });

  req.on('end', function() {
    res.end(data);
  })
}