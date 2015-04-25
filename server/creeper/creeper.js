"use strict";

var baseDir = __dirname + PATH_LINE;

var http = require("http");
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
var transdata = require("transdata");

var cheerio = require("cheerio");
var ejs = require("ejs");
var nodemailer = require("nodemailer");
var config = require("./config");
var source = require("./source");

var ids = [];
for(var k in source){
    ids.push(k);
}

var data = {};
var noop = function(){};
var isUpdate = false;//是否已经更新数据
var updateTime = 8;//每天0点更新一次数据
var updateJg = 60 * 60 * 1000;
var transporter = nodemailer.createTransport(config.mail.from);

//简单的数据爬取逻辑
function catchData(id , callback){
    var nowSource = source[id];

    callback = callback || noop;

    transdata.get(nowSource.url , function(result){
        result = nowSource.hanle(cheerio.load(result)).slice(0 , 10);

        if(result.length){
            data[id] = result;
        }

        callback();
    })
}

//邮件发送
function sendMail(subject, html) {
    var mailOptions = {
        from: 'wanghx<'+config.mail.from.auth.user+'>',
        to: config.mail.to.join(','),
        subject: subject,
        html: html
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
        transporter.close();
    });
};

//根据source里的源逐个爬取数据
function dataCollect(index , callback){
    callback = callback || noop;
    index = index || 0;

    catchData(ids[index] , function(){
        console.log(">【"+ids[index] + "】get√");

        index++;
        if(index == ids.length){
            console.log("数据采集完成..");
            callback();
        }else {
            dataCollect(index , callback);
        }
    })
}

function getHtml(data){
    var html = fs.readFileSync(baseDir + "creeper.ejs").toString();
    try{
        data = data || JSON.parse(JSON.parse(fs.readFileSync(baseDir + "result.txt").toString()).data);
        return ejs.render(html , {data:data});
    }catch(e){
        return html;
    }
}

function main(){
    var date = new Date();
    var time = date.getHours();

    if(time !== updateTime){
        isUpdate = false;
        return;
    }

    if(isUpdate) return;

    isUpdate = true;
    console.log("开始采集数据...");
    dataCollect(0 , function(){
        fs.readFile(baseDir + 'result.txt' , function(err , str){
            var jsonStr = JSON.stringify(data);
            var save = {
                data : jsonStr,
                md5 : crypto.createHash("md5").update(jsonStr).digest("hex")
            }

            if(!err){
                var oldjson = JSON.parse(str.toString())
            }

            if(err || oldjson.md5!==save.md5){
//                sendMail("每日博客", getHtml(data));
                fs.writeFileSync(baseDir + 'result.txt' , JSON.stringify(save));
            }else {
                console.log("数据无更新")
            }

            data = {}
        })
    });

    setTimeout(main , updateJg);
}

main();

module.exports = function(req , res){
    var html = getHtml();

    res.writeHead(200 , {'content-type':'text/html;charset=utf-8'});
    res.end(html);
};