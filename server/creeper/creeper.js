'use strict';

var fs = require('fs');
var path = require('path');
var transdata = require('transdata');
var router = require('../router');

var cheerio = require('cheerio');
var Mus = require('node-mus');
var mus = new Mus({
  baseDir: path.join(__dirname, './views')
});
var source = require('./source');
var EventEmitter = require('events').EventEmitter;
var redis = require('redis');

//连接redis
var client = redis.createClient();
var REDIS_OK = false;

client.on('connect', function() {
  console.log('redis 连接成功');
  REDIS_OK = true;
}).on('error', function() {
  REDIS_OK = false;
}).on('end', function() {
  REDIS_OK = false;
});

var emitter = new EventEmitter;
emitter.setMaxListeners(0);

//监听source文件改动，从而刷新引用的模块
fs.watch(require.resolve('./source.js'), function(e, filename) {
  if (e !== 'change') return;
  cleanCache(require.resolve('./source.js'));
  source = require('./source');
});

//清除模块缓存
function cleanCache(modulePath) {
  var module = require.cache[modulePath];

  if (module.parent) {
    module.parent.children.splice(module.parent.children.indexOf(module), 1);
  }

  require.cache[modulePath] = null;
}

//处理爬取数据
var creeper = function(req, res) {
  res.writeHead(200, { 'content-type': 'text/html;charset=utf-8' });
  res.write(mus.render('header', { keys: source.keys }));

  //console.log('采集数据...');

  var count = 0;
  source.forEach(function(index, id) {
    var nowSource = this;

    //将请求全部压入事件堆栈
    emitter.once('event_' + index, function(msg, result) {
      nowSource.isLoading = false;
      count++;

      if (msg == 'error') {
        //console.log('>【'+id+ '】fail× ：'+result.message);
      } else {
        //console.log('>【'+id+ '】get√');

        var $ = cheerio.load(result);
        var $colum = $(nowSource.colum);
        var list;
        result = [];
        $colum.each(function() {
          if (list = nowSource.handle($(this))) {
            result.push(list)
          }
        });
        if (typeof +nowSource.max == 'number') {
          result = result.slice(0, nowSource.max)
        }

        if (result.length) {
          var data = {};
          data[id] = result;
          result.index = index;

          var html = mus.render('contents', { data: data, url: nowSource.url });
          html = html.replace(/(\r|\n)\s*/g, '').replace(/'/g, '\\\'');
          res.write(`<script>loadHtml('${index}', 'dom_${index}', '${html}')</script>`);
        }
      }

      if (count == source.length) {
        //console.log('数据采集完成..');
        res.end(`</div></body></html>`);
      }
    });

    //如果正在加载数据时来了新请求则直接跳过，等此前的数据加载完毕后分发数据
    if (!nowSource.isLoading) {
      nowSource.isLoading = true;

      if (!REDIS_OK) {
        requestData();
        return;
      }

      //把数据存储到redis，数据将在一个小时候过期
      client.hgetall(nowSource.url, function(err, obj) {
        var time = +(new Date());
        if (err) {
          requestData();
          return;
        }

        if (!obj || (obj && ((time - obj.time) >= 60 * 60 * 1000))) {
          requestData();
        } else {
          emitter.emit('event_' + index, 'success', obj.html);
        }
      });
    }

    function requestData() {
      transdata.get(nowSource.url, function(result) {
        if (REDIS_OK) {
          client.hmset(nowSource.url, {
            time: +(new Date()),
            html: result
          });
        }
        emitter.emit('event_' + index, 'success', result);
      }, function(err) {
        emitter.emit('event_' + index, 'error', err);
      })
    }
  });
};

router.setMap('creeper', creeper);