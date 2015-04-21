var http = require('http');
var fs = require('fs');
var crypto = require("crypto");

var seesionMaps = {};
var transformSpeed = 0;

module.exports = {
    getProgress:getProgress,

    upload:upload
};

function getProgress(req , res){
    if(req.symbolKey in seesionMaps){
        seesionMaps[req.symbolKey].speed = transformSpeed;
        res.end(JSON.stringify(seesionMaps[req.symbolKey]) || 0);
    }else {
        res.end('0');
    }
}

function upload(req , res){
    var imgsays = [];
    var num = 0;
    var isStart = false;
    var ws;
    var filename;
    var path;

    try{
        fs.statSync(STATIC_PATH + '/upload')
    }catch(e){
        fs.mkdirSync(STATIC_PATH + '/upload')
    }

    //文件大小
    var fileSize = req.headers['content-length'];
    var maxSize = 5;
    if((fileSize/1024/1024) > maxSize){
        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8'});
        res.end('<div id="reason">上传的文件不能大于'+maxSize+'M</div>');
        return;
    }

    seesionMaps[req.symbolKey] = {
        now:0,
        all:fileSize
    };
    var time = new Date();

    req.on('data' , function(chunk){
        var start = 0;
        var end = chunk.length;
        var rems = [];

        seesionMaps[req.symbolKey].now+=chunk.length;

        var ntime = new Date();
        var speed = ~~(((chunk.length / 1024) / ((ntime - time) / 1000))+0.5);
        if(speed>0){
            if(speed <= 1024){
                transformSpeed = speed + "KB/S";
            }else {
                speed = ~~(speed / 1024);
                transformSpeed = speed + "MB/S";
            }
        }
        time = ntime;

        for(var i=0;i<chunk.length;i++){
            if(chunk[i]==13 && chunk[i+1]==10){
                num++;
                rems.push(i);

                if(num==4){
                    start = i+2;
                    isStart = true;

                    var str = (new Buffer(imgsays)).toString();
                    filename = str.match(/filename=".*"/g)[0].split('"')[1];
                    path = STATIC_PATH + '/upload/'+filename;
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
        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8'});
        res.end('<div id="path">/public/upload/'+filename+'</div>');

        transformSpeed = 0;
        delete seesionMaps[req.symbolKey];
    });
}
