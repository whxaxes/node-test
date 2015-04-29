"use strict";

var baseDir = __dirname + PATH_LINE;

var fs = require("fs");
var transdata = require("transdata");

var cheerio = require("cheerio");
var ejs = require("ejs");
var source = require("./source");

var ids = [];
for(var k in source){
    ids.push(k);
}

var creeper = function(req , res , urlObj){
    var header = fs.readFileSync(baseDir + "header.ejs").toString();
    var contents = fs.readFileSync(baseDir + "contents.ejs").toString();
    var foot = fs.readFileSync(baseDir + "foot.ejs").toString();

    res.writeHead(200 , {'content-type':'text/html;charset=utf-8'});
    res.write(ejs.render(header , {data:ids}));

    console.log("开始采集数据...");

    var count = 0;
    for(var i=0;i<ids.length;i++){
        (function(index){
            var id = ids[index];
            var nowSource = source[id];
            transdata.get(nowSource.url , function(result){
                count++;
                console.log(">【"+id+ "】get√");

                var $ = cheerio.load(result);
                var $colum = $(nowSource.colum);

                result = [];
                $colum.each(function(){
                    result.push(nowSource.handle($(this)))
                });
                if(typeof +nowSource.max == "number"){result = result.slice(0 , nowSource.max)}

                if(result.length){
                    var data = {};
                    data[id] = result;
                    result.index = index;

                    var html = ejs.render(contents , {data:data});
                    html = html.replace(/(\r|\n)\s*/g , '').replace(/'/g , "\\'");
                    res.write("<script>loadHtml("+index+" , 'dom_"+index+"' , '"+html+"')</script>");
                }

                if(count == ids.length){
                    console.log("数据采集完成..");
                    res.end(foot);
                }
            } , function(err){
                count++;
                console.log(">【"+id+ "】fail× ："+err.message);

                if(count == ids.length){
                    console.log("数据采集完成..");
                    res.end(foot);
                }
            })
        }(i))
    }
};

module.exports = creeper;