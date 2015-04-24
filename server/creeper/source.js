"use strict";

String.prototype.trim = function(){
    return this.replace(/(^(\s+))|((\s+)$)/g, '');
}

module.exports = {
    "AlloyTeam" : {
        url:"http://www.alloyteam.com",
        hanle:function($){
            var result = [];
            var $colum = $(".articlemenu>li");

            $colum.each(function(i , ele){
                try{
                    var time = $(this).find(".blogPs").text().match(/\d{4}[^x00-xff]{1}\d{1,2}[^x00-xff]{1}\d{1,2}/)[0].replace(/[^x00-xff]/g , '-');
                }catch(e){}

                result.push({
                    url:$(this).find(".blogTitle").attr("href"),
                    title:$(this).find(".blogTitle").text().trim(),
                    time:time||""
                })
            })
            return result;
        }
    },

    "Isux":{
        url:"http://isux.tencent.com/",
        hanle:function($){
            var result = [];
            var $colum = $(".list-wrap .column");

            $colum.each(function(){
                result.push({
                    url:$(this).find(".img-wrap").attr("href"),
                    title:$(this).find(".btitle").text(),
                    time:""
                })
            });
            return result;
        }
    },

    "CDC":{
        url:"http://cdc.tencent.com/",
        hanle:function($){
            var result = [];
            var $colum = $(".content_text");

            $colum.each(function(){
                try{
                    var time = $(this).find(".title p").text().match(/\d{4}\.\d{1,2}\.\d{1,2}/)[0].replace(/\./ , "-")
                }catch(e){}

                result.push({
                    url:$(this).find(".title h3 a").attr("href"),
                    title:$(this).find(".title h3 a").text(),
                    time:time||""
                })
            });
            return result;
        }
    },

    "TaobaoUED":{
        url:"http://ued.taobao.org/blog/",
        hanle:function($){
            var result = [];
            var $colum = $(".post-list .post");

            $colum.each(function(){
                result.push({
                    url:$(this).find(".post-title").attr("href"),
                    title:$(this).find(".post-title").text(),
                    time:$(this).find(".post-date").text().trim().replace(/\//g , '-')
                })
            })
            return result;
        }
    },

    "Web前端开发":{
        url:"http://www.css88.com/",
        hanle:function($){
            var result = [];
            var $colum = $(".site-content .post");

            $colum.each(function(){
                try{
                    var time = $(this).find(".entry-date").text().match(/\d{4}[^x00-xff]{1}\d{1,2}[^x00-xff]{1}\d{1,2}/)[0].replace(/[^x00-xff]/g , '-')
                }catch(e){}

                result.push({
                    url:$(this).find(".entry-title a").attr("href"),
                    title:$(this).find(".entry-title").text(),
                    time:time||""
                })
            })
            return result;
        }
    }
}