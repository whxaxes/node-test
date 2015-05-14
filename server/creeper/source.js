"use strict";

String.prototype.trim = function(){
    return this.replace(/(^(\s+))|((\s+)$)/g, '');
};

var TIME_REG_1 = /\d{4}[^x00-xff]\d{1,2}[^x00-xff]\d{1,2}[^x00-xff]/;    //匹配XXXX年XX月XX日
var TIME_REG_2 = /\d{4}-\d{1,2}-\d{1,2}/;        //匹配XXXX-XX-XX

var sourceList = {
    "W3ctech":{
        url:"http://www.w3ctech.com/",
        colum:".bd_box .topic_list_content",
        handle:function($colum){
            var ignoreList = ["意见与建议","新闻","活动","thinkjs"];
            if(ignoreList.indexOf($colum.find(".badge_category").text())>=0) return;

            var _time = $colum.find(".relative-date").text();
            var time = _time.match(TIME_REG_2);
            return {
                url:this.url + $colum.find(".topic_title a").attr("href"),
                title:$colum.find(".topic_title a").text(),
                time:(time instanceof Array)?time[0]:_time
            }
        }
    },

    "前端头条":{
        url:"http://top.css88.com/",
        colum:".status-publish",
        handle:function($colum){
            return {
                url:$colum.find(".entry-title a").attr("href"),
                title:$colum.find(".entry-title a").text(),
                time:$colum.find(".entrymeta>p>span").eq(1).text()
            }
        }
    },

    "前端观察":{
        url:"http://www.qianduan.net/",
        colum:".main-content .post",
        handle:function($colum){
            return {
                url:$colum.find(".post-title a").attr("href"),
                title:$colum.find(".post-title a").text(),
                time:$colum.find(".post-date").attr("datetime")
            }
        }
    },

    "AlloyTeam" : {
        url:"http://www.alloyteam.com",
        colum:".articlemenu>li",
        handle:function($colum){
            var time = $colum.find(".blogPs").text().match(TIME_REG_1);
            return {
                url:$colum.find(".blogTitle").attr("href"),
                title:$colum.find(".blogTitle").text().trim(),
                time:(time instanceof Array)?time[0]:""
            }
        }
    },

    "FEX":{
        url:"http://fex.baidu.com/",
        colum:".container .post-list>li",
        handle:function($colum){
            var time = $colum.find(".date").text().split(" ");
            time = time.slice(time.length-3 , time.length).join(" ");
            return {
                url:this.url + $colum.find("a").attr("href"),
                title:$colum.find("p").text(),
                time:time
            }
        }
    },

    "W3cplus":{
        url:"http://www.w3cplus.com/",
        colum:".region-content .node-blog",
        handle:function($colum){
            var time = $colum.find(".submitted").text().match(TIME_REG_2);
            return {
                url:this.url + $colum.find("h1>a").attr("href"),
                title:$colum.find("h1>a").text(),
                time:(time instanceof Array)?time[0]:""
            }
        }
    },

    "Web前端开发":{
        url:"http://www.css88.com/",
        colum:".site-content .post",
        handle:function($colum){
            var time = $colum.find(".entry-date").text().match(TIME_REG_1);
            return {
                url:$colum.find(".entry-title a").attr("href"),
                title:$colum.find(".entry-title").text(),
                time:(time instanceof Array)?time[0]:""
            }
        }
    },

    "小胡子的博客":{
        url:"http://www.cnblogs.com/hustskyking/",
        colum:".post-list-item",
        handle:function($colum){
            var time = $colum.find("small").text().match(TIME_REG_2);
            return {
                url:$colum.find(".PostTitle").attr("href"),
                title:$colum.find(".PostTitle").text(),
                time:time[0]
            }
        }
    },

    "叶小钗的博客":{
        url:"http://www.cnblogs.com/yexiaochai/",
        colum:".day",
        handle:function($colum){
            var time = $colum.find(".dayTitle").text().match(TIME_REG_1);
            if(!time) return;

            return {
                url:$colum.find(".postTitle a").attr("href"),
                title:$colum.find(".postTitle a").text(),
                time:time[0]
            }
        }
    },

    "刘哇勇的博客":{
        url:"http://www.cnblogs.com/Wayou/",
        colum:".day",
        handle:function($colum){
            var time = $colum.find(".postDesc").text().match(TIME_REG_2);
            return {
                url:$colum.find(".postTitle a").attr("href"),
                title:$colum.find(".postTitle a").text(),
                time:(time instanceof Array)?time[0]:""
            }
        }
    }
};

var source = {};
var l = 0;
for(var k in sourceList){l++}
source.length = l;

source.forEach = function(callback){
    var i = 0;
    for(var k in sourceList){
        callback.call(sourceList[k] , i , k);
        i++;
    }
};

source.get = function(id){
    return sourceList[id]
};

module.exports = source;