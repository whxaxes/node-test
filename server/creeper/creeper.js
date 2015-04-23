var baseDir = __dirname + PATH_LINE;

var http = require("http");
var cheerio = require("cheerio");
var ejs = require("ejs");
var fs = require("fs");
var path = require("path");

var crypto = require("crypto");
var nodemailer = require("nodemailer");
var config = require("./config");
var source = require("./source");

var ids = [];
for(var k in source){
    ids.push(k);
}

var noop = function(){};

//简单的数据爬取逻辑
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

//邮件发送
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

//根据source里的源逐个爬取数据
function dataCollect(index , callback){
    callback = callback || noop;
    index = index || 0;

    catchData(ids[index] , function(){
        console.log(">【"+ids[index] + "】get√");

        index++;
        if(index == ids.length){
            console.log("数据采集完成..")
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

module.exports = function(req , res){
    var html = getHtml();

    res.writeHead(200 , {'content-type':'text/html;charset=utf-8'});
    res.end(html);

    //发送邮件给自己
    //sendMail("每日博客", html);
};

var olddate = null;
var updateTime = 0;//每天0点更新一次数据
function main(){
    var date = new Date();
    var time = date.getHours();


    if(date === olddate || time !== updateTime) return;

    olddate = date;
    console.log("开始采集数据...");
    dataCollect(0 , function(){
        fs.readFile(baseDir + 'result.txt' , function(err , str){
            var jsonStr = JSON.stringify(data);
            var save = {
                data : jsonStr,
                md5 : crypto.createHash("md5").update(jsonStr).digest("hex")
            }

            if(!err){
                var oldmd5 = JSON.parse(str.toString());
            }

            if(err || oldmd5!==save.md5){
                sendMail("每日博客", getHtml(data));
                fs.writeFileSync(baseDir + 'result.txt' , JSON.stringify(save));
            }

            data = {}
        })
    });

    setTimeout(main , 60 * 60 * 1000);
}

main();