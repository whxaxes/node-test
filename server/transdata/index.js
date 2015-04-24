"use strict";

var http = require("http");
var stream = require("stream");
var url = require("url");

var noop = function () {};

//两种请求
var transdata = {
    post: function (opt) {
        opt.method = "post";
        main(opt);
    },

    get: function (opt) {
        if(arguments.length>=2 && (typeof arguments[0]=="string") && (typeof arguments[1]=="function")){
            opt = {
                url:arguments[0],
                success:arguments[1]
            };

            if(arguments[2] && (typeof arguments[2]=="function")){
                opt.error = arguments[2];
            }
        }

        opt.method = "get";
        main(opt);
    }
};

//转发请求主要逻辑
function main(opt) {
    var options, creq;

//    可以为response对象，也可以为一个可写流
    opt.res = ((opt.res instanceof http.ServerResponse) || (opt.res instanceof stream.Writable)) ? opt.res : null;

//    请求成功或失败后的回调
    opt.success = (typeof opt.success == "function") ? opt.success : noop;
    opt.error = (typeof opt.error == "function") ? opt.error : noop;

    try {
        opt.url = (typeof opt.url == "string") ? url.parse(opt.url) : null;
    } catch (e) {
        opt.url = null;
    }

    if (!opt.url) {
        opt.error(new Error("url is illegal"));
        return;
    }

    if (opt.method == "get") {
        http.get(opt.url.href, function (res) {
            reqCallback(opt.res, res, opt.success)
        }).on("error", function (e) {
            opt.error(e);
        })
    } else {
        options = {
            hostname: opt.url.hostname,
            port: opt.url.port,
            path: opt.url.pathname,
            method: "post"
        };

//        如果req为可读流则使用pipe连接，传输数据，如果不是则直接write
        if (opt.req instanceof stream.Readable) {
            if ('headers' in opt.req) {
                options['headers'] = {
                    'Content-Type': opt.req.headers['content-type'],
                    'Content-Length': opt.req.headers['content-length']
                };
            }

            process.nextTick(function(){
                opt.req.pipe(creq);
            })
        } else if ((typeof opt.req) == "string") {
            options['headers'] = {
                'Content-Type': "text/plain; charset=utf-8",
                'Content-Length': opt.req.length
            };

            process.nextTick(function(){
                creq.write(opt.req);
                creq.end();
            })
        }else {
            opt.error(new Error("illegal request"));
            return;
        }

        creq = http.request(options, function (res) {
            reqCallback(opt.res, res, opt.success)
        }).on('error', function (e) {
            opt.error(e);
        })
    }
}

//请求的回调
function reqCallback(ores, res, callback) {
    if (ores) {
        ores.on('finish', function () {
            callback();
        });

        if (ores instanceof http.ServerResponse) {
            ores.writeHead(200, {
                'Content-Type': res.headers['content-type'] || 'application/json; charset=UTF-8',
                'Content-Length': res.headers['content-length']
            });
        }

        res.pipe(ores);
    } else {
        var size = 0;
        var chunks = [];

        res.on('data', function (chunk) {
            size += chunk.length;
            chunks.push(chunk);
        }).on('end', function () {
            callback(Buffer.concat(chunks, size).toString())
        })
    }
}

module.exports = transdata;

