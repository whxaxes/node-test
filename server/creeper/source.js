"use strict";

String.prototype.trim = function(){
    return this.replace(/(^(\s+))|((\s+)$)/g, '');
};

module.exports = {
    "w3ctech":{
        url:"http://www.w3ctech.com/",
        colum:".bd_box .topic_list_content",
        handle:function($colum){
            return {
                url:this.url + $colum.find(".topic_title a").attr("href"),
                title:$colum.find(".topic_title a").text(),
                time:""
            }
        }
    },

    "AlloyTeam" : {
        url:"http://www.alloyteam.com",
        colum:".articlemenu>li",
        handle:function($colum){
            try{
                var time = $colum.find(".blogPs").text().match(/\d{4}[^x00-xff]\d{1,2}[^x00-xff]\d{1,2}/)[0].replace(/[^x00-xff]/g , '-');
            }catch(e){}
            return {
                url:$colum.find(".blogTitle").attr("href"),
                title:$colum.find(".blogTitle").text().trim(),
                time:time||""
            }
        }
    },

    "FEX":{
        url:"http://fex.baidu.com/",
        colum:".container .post-list>li",
        handle:function($colum){
            return {
                url:this.url + $colum.find("a").attr("href"),
                title:$colum.find("p").text(),
                time:""
            }
        }
    },

    "w3cplus":{
        url:"http://www.w3cplus.com/",
        colum:".region-content .node-blog",
        handle:function($colum){
            return {
                url:this.url + $colum.find("h1>a").attr("href"),
                title:$colum.find("h1>a").text(),
                time:$colum.find(".submitted").text().match(/\d{4}-\d{1,2}-\d{1,2}/)[0]
            }
        }
    },

    "Isux":{
        url:"http://isux.tencent.com/",
        colum:".list-wrap .column",
        handle:function($colum){
            return {
                url:$colum.find(".img-wrap").attr("href"),
                title:$colum.find(".btitle").text(),
                time:""
            }
        }
    },

    "Web前端开发":{
        url:"http://www.css88.com/",
        colum:".site-content .post",
        handle:function($colum){
            try{
                var time = $colum.find(".entry-date").text().match(/\d{4}[^x00-xff]\d{1,2}[^x00-xff]\d{1,2}/)[0].replace(/[^x00-xff]/g , '-')
            }catch (e){}
            return {
                url:$colum.find(".entry-title a").attr("href"),
                title:$colum.find(".entry-title").text(),
                time:time||""
            }
        }
    },

    "CDC":{
        url:"http://cdc.tencent.com/",
        colum:".content_text",
        handle:function($colum){
            try{
                var time = $colum.find(".title p").text().match(/\d{4}\.\d{1,2}\.\d{1,2}/)[0].replace(/\./ , "-")
            }catch(e){}
            return {
                url:$colum.find(".title h3 a").attr("href"),
                title:$colum.find(".title h3 a").text(),
                time:time||""
            }
        }
    },

    "TaobaoUED":{
        url:"http://ued.taobao.org/blog/",
        colum:".post-list .post",
        handle:function($colum){
            return {
                url:$colum.find(".post-title").attr("href"),
                title:$colum.find(".post-title").text(),
                time:$colum.find(".post-date").text().trim().replace(/\//g , '-')
            }
        }
    }
};