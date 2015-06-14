//测试图片压缩上传功能
"use strict";

var fs = require('fs');
var router = require("easy-router");

router.setMap({
    "uindex_2" : "upload/index_2.html",
    "cupload" : cupload
});

function cupload(req , res){
    var imgsays = [],
        num = 0,
        isStart = false;

    var ws ,
        filename ,
        path;

    try{
        fs.statSync(STATIC_PATH + '/upload')
    }catch(e){
        fs.mkdirSync(STATIC_PATH + '/upload')
    }

    req.on('data' , function(chunk){
        var start = 0;
        var end = chunk.length;
        var rems = [];

        for(var i=0;i<chunk.length;i++){
            if(chunk[i]==13 && chunk[i+1]==10){
                num++;
                rems.push(i);

                if(num==4){
                    start = i+2;
                    isStart = true;

                    var str = (new Buffer(imgsays)).toString();
                    filename = +(new Date()) + ~~(Math.random()*10000);
//                    filename = "upload";

                    /Content-Type: image\/([a-z]+)/.test(str);
                    filename += "." + (RegExp.$1 || "jpg");

                    path = STATIC_PATH + 'upload/' + filename;
                    ws = fs.createWriteStream(path);
                }else if(i==chunk.length-2){    //说明到了数据尾部的\r\n
                    end = rems[rems.length-2];
                    break;
                }
            }

            if(num<4){
                imgsays.push(chunk[i])
            }
        }

        if(isStart){
            ws.write(chunk.slice(start , end));
        }
    });

    req.on("end",function(){
        ws.end();
        console.log("保存"+filename+"成功");
        res.writeHead(200);
        res.end('/public/upload/'+filename);

//      每张图片给予一分钟保存时间
        setTimeout(function(){
            if(fs.existsSync(STATIC_PATH + 'upload/' + filename)){
                console.log("删除" + filename);
                fs.unlinkSync(STATIC_PATH + 'upload/' + filename)
            }
        } , 60 * 1000);
    });
}