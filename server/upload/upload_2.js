/*
*移动端图片压缩上传功能后台
 */
"use strict";

var fs = require('fs');
var router = require("easy-router");
var FormParser = require("./formParser");

var fileSaveDir = STATIC_PATH + 'upload';

router.setMap({
    "uindex_2" : "upload/index_2.html",
    "cupload" : cupload
});

function cupload(req , res){
    if(!fs.existsSync(fileSaveDir)){fs.mkdirSync(fileSaveDir)}

    var formparser = new FormParser(fileSaveDir);

    req.encoding = "utf-8";
    req.on('data' , function(chunk){
        formparser.push(chunk);
    });

    req.on("end",function(){
        var data = [];
        formparser.formDataArray.forEach(function(fdata){
            switch (fdata.type){
                case "image":
                    data.push({
                        type : fdata.type,
                        path : '/public/upload/'+fdata.filename,
                        size : fdata.size/1024 > 1024 ? (~~(10*fdata.size/1024/1024))/10 + "MB" :  ~~(fdata.size/1024) + "KB"
                    });

//                  每张图片给予一分钟保存时间
                    setTimeout(function(){
                        if(!fs.existsSync(fdata.path)) return;

                        console.log("\x1B[33m删除文件" + fdata.filename + "\x1B[0m");
                        fs.unlinkSync(fdata.path);
                    } , 60 * 1000);

                    break;
                default :break;
            }
        });
        formparser.clear();

        res.writeHead(200);
        res.end(JSON.stringify(data));
    });
}