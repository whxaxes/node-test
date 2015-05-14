"use strict";

var baseDir = __dirname + PATH_LINE;

var fs = require("fs");
var transdata = require("transdata");

var cheerio = require("cheerio");
var ejs = require("ejs");
var source = require("./source");
var EventEmitter = require("events").EventEmitter;

var emitter = new EventEmitter;
emitter.setMaxListeners(0);

var header = fs.readFileSync(baseDir + "views/header.ejs").toString();
var contents = fs.readFileSync(baseDir + "views/contents.ejs").toString();
var foot = fs.readFileSync(baseDir + "views/foot.ejs").toString();

var creeper = function(req , res){
    res.writeHead(200 , {'content-type':'text/html;charset=utf-8'});
    res.write(header);

    console.log("采集数据...");
    var count = 0;
    source.forEach(function(index , id){
        var nowSource = this;

        //将请求全部压入事件堆栈
        emitter.once("event_"+index , function(msg , result){
            count++;
            if(msg == "error"){
                console.log(">【"+id+ "】fail× ："+result.message);
            }else {
                console.log(">【"+id+ "】get√");

                var $ = cheerio.load(result);
                var $colum = $(nowSource.colum);
                var list;
                result = [];
                $colum.each(function(){
                    if(list = nowSource.handle($(this))){
                        result.push(list)
                    }
                });
                if(typeof +nowSource.max == "number"){result = result.slice(0 , nowSource.max)}

                if(result.length){
                    var data = {};
                    data[id] = result;
                    result.index = index;

                    var html = ejs.render(contents , {data:data , url:nowSource.url});
                    html = html.replace(/(\r|\n)\s*/g , '').replace(/'/g , "\\'");
                    res.write("<script>loadHtml("+index+" , 'dom_"+index+"' , '"+html+"')</script>");
                }
            }

            if(count == source.length){
                console.log("数据采集完成..");
                res.end(foot);
            }
        });

        //如果正在加载数据时来了新请求则直接跳过，等此前的数据加载完毕后分发数据
        if(!nowSource.isLoading){
            nowSource.isLoading = true;

            transdata.get(nowSource.url , function(result){
                emitter.emit("event_"+index , 'success' , result);
                nowSource.isLoading = false;
            } , function(err){
                emitter.emit("event_"+index , 'error' , err);
                nowSource.isLoading = false;
            })
        }
    });
};

module.exports = creeper;