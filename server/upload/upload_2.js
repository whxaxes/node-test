/*
 *移动端图片压缩上传功能后台
 */
"use strict";

var fs = require('fs');
var router = require("easy-router");
//var FormParser = require("./formParser");
var formidable = require('formidable');
var path = require('path');

var fileSaveDir = STATIC_PATH + 'upload';

router.setMap({
  "uindex_2": "upload/index_2.html",
  "cupload": cupload
});

function cupload(req, res) {
  if (!fs.existsSync(fileSaveDir)) {
    fs.mkdirSync(fileSaveDir)
  }

  var form = new formidable.IncomingForm();
  var responseData = [];
  form.uploadDir = fileSaveDir;
  form.type = true;
  form.keepExtensions = true;

  form.parse(req, function(err, fields, files){
    if(!err) {
      Object.keys(files).forEach(function(key){
        var file = files[key];
        var filename = path.basename(file.path);

        //每张图片给予一分钟保存时间
        setTimeout(function() {
          if (!fs.existsSync(file.path)) return;

          console.log("\x1B[33m删除文件" + filename + "\x1B[0m");
          fs.unlinkSync(file.path);
        }, 60 * 1000);

        // 塞入响应数据中
        responseData.push({
          type: file.type,
          name: filename,
          path: '/public/upload/' + filename,
          size: file.size / 1024 > 1024 ? (~~(10 * file.size / 1024 / 1024)) / 10 + "MB" : ~~(file.size / 1024) + "KB"
        });
      });
    } else {
      console.warn(err);
    }

    res.writeHead(200);
    res.end(JSON.stringify(responseData));
  });
}