<!DOCTYPE html>
<html>
<head lang="en">
  <meta charset="UTF-8">
  <title>抓取博客首页信息</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
    }

    * {
      font-family: "微软雅黑";
    }

    .wrap {
      width: 100%;
      overflow: hidden;
      padding-bottom: 50px;
    }

    ul, li {
      margin: 0;
      padding: 0;
      list-style-type: none !important;
    }

    .content {
      margin-top: 30px;
      -webkit-transition: padding .3s;
      transition: padding .3s;
      padding-left: 15px;
    }

    .mb-nav {
      min-width: 800px;
      margin-bottom: 30px;
    }

    .mb-blog-name {
      display: block;
      margin: 10px;
      font-size: 20px;
      font-weight: bold;
      -webkit-transition: color .3s;
      transition: color .3s;
    }

    .mb-blog-name:hover {
      color: #f86143;
    }

    .mb-item, .no-data {
      -webkit-transition: background-color .3s;
      transition: background-color .3s;
    }

    .mb-item:hover {
      background-color: #f86143;
    }

    a {
      outline: none;
      color: #333;
      text-decoration: none !important;
    }

    .mb-item a {
      display: block;
      padding: 0 20px;
      line-height: 30px;
      -webkit-transition: padding .3s;
    }

    .mb-item:hover a {
      color: #fff;
      padding-left: 30px;
    }

    .blog-time {
      font-size: 13px;
      float: right;
    }

    .left-side {
      position: fixed;
      width: 200px;
      top: 0;
      bottom: 0;
      left: 0;
      margin: auto;
      z-index: 999;
      background-color: #f86143;
      -webkit-transition: -webkit-transform .3s;
      transition: transform .3s;
      -webkit-transform: translate3d(-185px, 0, 0);
      transform: translate3d(-185px, 0, 0);
      cursor: pointer;
    }

    .keys {
      margin-top: 30px;
    }

    .close {
      position: absolute;
      display: none;
      color: #eee;
      width: 30px;
      line-height: 30px;
      right: 5px;
      top: 5px;
      text-align: center;
    }

    .close:hover {
      color: #FFF;
    }

    .keys li {
      display: block;
      color: #FFF;
      padding: 5px 10px;
      opacity: .8;
    }

    .keys li:hover {
      opacity: 1;
    }

    .keys .loading {
      opacity: .2 !important;
    }

    /*显示左边栏*/
    .show-side .close {
      display: block;
    }

    .show-side .left-side {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }

    .show-side .content {
      padding-left: 200px;
    }
  </style>
  <script src="http://lib.sinaapp.com/js/jquery/1.9.1/jquery-1.9.1.min.js"></script>
  <script>
    if (!window.jQuery) {
      document.write('<script src="/public/jquery-2.1.1.min.js"><\/script>');
    }
  </script>
  <script>
    var sort = {};
    //        将dom按后台source的顺序放好
    function loadHtml(number, id, html) {
      var $dom;

      for (var k in sort) {
        if (number < k) {
          $dom = sort[k];
          break;
        }
      }

      if (!$dom) {
        $(".content").append(html);
      } else {
        $dom.before(html);
      }

      sort[number] = $("#" + id);

      $(".left-side .keys li").eq(number).removeClass("loading")
              .find(".count").html($("#" + id + " li").length || 0);
    }
  </script>
</head>
<body>
<div class="wrap">
  <div class="show-left-side"></div>
  <div class="left-side">
    <ul class="keys">
      {% for key in keys %}
        <li class="loading" data-key="dom_{{ loop.index0 }}">
          {{ key }}(<span class="count">0</span>)
        </li>
      {% endfor %}
    </ul>
  </div>
  <script>
    var $wrap = $(".wrap");
    $(".left-side").click(function(e) {
      var li = e.target.tagName == "LI" ? e.target : (e.target.parentNode.tagName == "LI") ? e.target.parentNode : null
      if ($wrap.hasClass("show-side") && li) {
        var id = $(li).attr("data-key")
        var $dom = $("#" + id);
        if ($dom.length) {
          $(window).scrollTop($dom.offset().top)
        }
      } else {
        $wrap.toggleClass("show-side")
      }
    });
    setTimeout(function() {
      $(".left-side").click();
    }, 200);
  </script>
  <div class="content"></div>