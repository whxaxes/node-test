"use strict";

var TIME_REG_1 = /\d{4}[^x00-xff]\d{1,2}[^x00-xff]\d{1,2}[^x00-xff]/;    //匹配XXXX年XX月XX日
var TIME_REG_2 = /\d{4}-\d{1,2}-\d{1,2}/;        //匹配XXXX-XX-XX
var TIME_REG_3 = /\d{4}\/\d{2}\/\d{2}/;        //匹配XXXX/XX/XX
var TIME_REG_4 = /\d{4}\.\d{2}\.\d{2}/;        //匹配XXXX.XX.XX

var sourceList = {
  "W3ctech": {
    url: "http://www.w3ctech.com/",
    colum: ".bd_box .topic_list_content",
    handle: function($colum) {
      var ignoreList = ["意见与建议", "新闻", "活动", "thinkjs"];
      if (ignoreList.indexOf($colum.find(".badge_category").text()) >= 0) return;

      var _time = $colum.find(".relative-date").text();
      var time = _time.match(TIME_REG_2);
      return {
        url: this.url + $colum.find(".topic_title a").attr("href"),
        title: $colum.find(".topic_title a").text(),
        time: (time instanceof Array) ? time[0] : _time
      }
    }
  },

  "伯乐在线": {
    url: "http://web.jobbole.com/all-posts/",
    colum: ".post",
    handle: function($colum) {
      var time = $colum.find(".post-meta p").eq(0).text().match(TIME_REG_3);
      return {
        url: $colum.find(".archive-title").attr("href"),
        title: $colum.find(".archive-title").text(),
        time: (time instanceof Array) ? time[0] : ""
      }
    }
  },

  "COCOACHINA": {
    url: "http://www.cocoachina.com/webapp/",
    colum: ".leftSide li",
    handle: function($colum) {
      var time = $colum.text().match(TIME_REG_2);
      return {
        url: "http://www.cocoachina.com" + $colum.find(".newstitle a").attr("href"),
        title: $colum.find(".newstitle a").text(),
        time: (time instanceof Array) ? time[0] : ""
      }
    }
  },

  "阮一峰的js博文": {
    url: "http://www.ruanyifeng.com/blog/javascript/",
    colum: "#alpha .module-list-item",
    handle: function($colum) {
      var time = $colum.find(".hint").text().match(TIME_REG_4);
      return {
        url: $colum.find("a").attr("href"),
        title: $colum.find("a").text(),
        time: (time instanceof Array) ? time[0] : ""
      }
    }
  },

  "前端头条": {
    url: "http://top.css88.com/",
    colum: ".status-publish",
    handle: function($colum) {
      return {
        url: $colum.find(".entry-title a").attr("href"),
        title: $colum.find(".entry-title a").text(),
        time: $colum.find(".entrymeta>p>span").eq(1).text()
      }
    }
  },

  "前端观察": {
    url: "http://www.qianduan.net/",
    colum: ".main-content .post",
    handle: function($colum) {
      return {
        url: this.url + $colum.find(".post-title a").attr("href"),
        title: $colum.find(".post-title a").text(),
        time: $colum.find(".post-date").attr("datetime")
      }
    }
  },

  "AlloyTeam": {
    url: "http://www.alloyteam.com",
    colum: ".articlemenu>li",
    handle: function($colum) {
      var time = $colum.find(".blogPs").text().match(TIME_REG_1);
      return {
        url: $colum.find(".blogTitle").attr("href"),
        title: $colum.find(".blogTitle").text().trim(),
        time: (time instanceof Array) ? time[0] : ""
      }
    }
  },

  "FEX": {
    url: "http://fex.baidu.com/",
    colum: ".container .post-list>li",
    handle: function($colum) {
      var time = $colum.find(".date").text().split(" ");
      time = time.slice(time.length - 3, time.length).join(" ");
      return {
        url: this.url + $colum.find("a").attr("href"),
        title: $colum.find("p").text(),
        time: time
      }
    }
  },

  "W3cplus": {
    url: "http://www.w3cplus.com/",
    colum: ".region-content .node-blog",
    handle: function($colum) {
      var time = $colum.find(".submitted").text().match(TIME_REG_2);
      return {
        url: this.url + $colum.find("h1>a").attr("href"),
        title: $colum.find("h1>a").text(),
        time: (time instanceof Array) ? time[0] : ""
      }
    }
  },

  "Web前端开发": {
    url: "http://www.css88.com/",
    colum: ".site-content .post",
    handle: function($colum) {
      var time = $colum.find(".entry-date").text().match(TIME_REG_1);
      return {
        url: $colum.find(".entry-title a").attr("href"),
        title: $colum.find(".entry-title").text(),
        time: (time instanceof Array) ? time[0] : ""
      }
    }
  },

  "Isux": {
    url: "http://isux.tencent.com/",
    colum: ".list-wrap .column",
    handle: function($colum) {
      return {
        url: $colum.find(".img-wrap").attr("href"),
        title: $colum.find(".btitle").text(),
        time: ""
      }
    }
  },

  "张鑫旭的博客": {
    url: "http://www.zhangxinxu.com/wordpress/",
    colum: ".the_main .post",
    handle: function($colum) {
      return {
        url: $colum.find(".entry-title").attr("href"),
        title: $colum.find(".entry-title").text(),
        time: $colum.find(".date").text()
      }
    }
  },

  "小胡子的博客": {
    url: "http://www.cnblogs.com/hustskyking/",
    colum: ".post-list-item",
    handle: function($colum) {
      var time = $colum.find("small").text().match(TIME_REG_2);
      return {
        url: $colum.find(".PostTitle").attr("href"),
        title: $colum.find(".PostTitle").text(),
        time: time[0]
      }
    }
  },

  "叶小钗的博客": {
    url: "http://www.cnblogs.com/yexiaochai/",
    colum: ".day",
    handle: function($colum) {
      var time = $colum.find(".dayTitle").text().match(TIME_REG_1);
      if (!time) return;

      return {
        url: $colum.find(".postTitle a").attr("href"),
        title: $colum.find(".postTitle a").text(),
        time: time[0]
      }
    }
  },

  "刘哇勇的博客": {
    url: "http://www.cnblogs.com/Wayou/",
    colum: ".day",
    handle: function($colum) {
      var time = $colum.find(".postDesc").text().match(TIME_REG_2);
      return {
        url: $colum.find(".postTitle a").attr("href"),
        title: $colum.find(".postTitle a").text(),
        time: (time instanceof Array) ? time[0] : ""
      }
    }
  }
};

var source = {};
var l = 0;
source.keys = [];
for (var k in sourceList) {
  source.keys.push(k);
  l++;
}
source.length = l;

source.forEach = function(callback) {
  var i = 0;
  for (var k in sourceList) {
    callback.call(sourceList[k], i, k);
    i++;
  }
};

source.get = function(id) {
  return sourceList[id]
};

module.exports = source;