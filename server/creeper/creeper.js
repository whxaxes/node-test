var baseDir = __dirname + PATH_LINE;

var http = require("http");
var cheerio = require("cheerio");
var ejs = require("ejs");
var fs = require("fs");
var path = require("path");
var nodemailer = require("nodemailer");
var config = require("./config");
var source = require("./source");

var ids = [];
for(var k in source){
    ids.push(k);
}

var noop = function(){};

var data = {};
function catchData(id , callback){
    var nowSource = source[id];

    callback = callback || noop;

    http.get(nowSource.url , function(res){
        var size = 0;
        var chunks = [];

        res.on('data' , function(chunk){
            size += chunk.length;
            chunks.push(chunk);
        });

        res.on('end' , function(){
            var result = Buffer.concat(chunks , size).toString();

            result = nowSource.hanle(cheerio.load(result)).slice(0 , 10)

            if(result.length){
                data[id] = result;
            }

            callback();
        });
    })
}

var transporter = nodemailer.createTransport(config.mail.from);
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

function dataCollect(index){
    index = index || 0;
    catchData(ids[index] , function(){
        console.log("【"+ids[index] + "】数据采集成功");

        index++;
        if(index == ids.length){
            fs.writeFileSync(baseDir + 'result.txt' , JSON.stringify(data));
            console.log("数据采集完成..")
        }else {
            dataCollect(index);
        }
    })
}

function getHtml(){
    var html = fs.readFileSync(baseDir + "creeper.ejs").toString();
    var data = JSON.parse(fs.readFileSync(baseDir + "result.txt").toString());
    return ejs.render(html , {data:data});
}

module.exports = function(req , res){
    var html = getHtml();

    res.writeHead(200 , {'content-type':'text/html;charset=utf-8'});
    res.end(html);

    //发送邮件给自己
    //sendMail("每日博客", html);
};

var olddate = null;
function main(){
    var date = new Date();

    if(date !== olddate){
        var time = date.getHours();
        if(time==16){
            olddate = date;
            console.log("开始采集数据...");
            dataCollect();
        }
    }

    setTimeout(main , 60 * 60 * 1000);
}

main();