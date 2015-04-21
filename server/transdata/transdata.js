//数据地址表
var sourceAddress = {
    smoke:{
        hostname:'100.84.47.67',
        port:9261
    },
    local:{
        hostname:'100.84.52.111',
        port:9261
    }
}
var sourceKind = 'smoke';

module.exports = function(req , res , urlObj){
    //请求转发逻辑
    var options = {
        hostname:sourceAddress[sourceKind].hostname,
        port:sourceAddress[sourceKind].port,
        path:urlObj.pathname,
        method:'post',
        headers:{
            'Content-Type':req.headers['content-type'],
            'Content-Length':req.headers['content-length']
        }
    }

    //建立链向数据服务器的请求
    var creq = http.request(options , function(cres){
        console.log(urlObj.pathname+"：服务器响应成功...");

        res.writeHead(200 , {
            'Content-Type':cres.headers['content-type'] || 'application/json; charset=UTF-8',
            'Content-Length':cres.headers['content-length']
        });

        var once = false;
        cres.on('data' , function(chunk){
            if(!once){
                console.log(urlObj.pathname+"：开始接收数据并写出...");
                once = !once;
            }
            res.write(chunk);
        }).on('end' , function(){
            console.log(urlObj.pathname+"：接收完成");
            res.end();
        })
    }).on('error' , function(e){
        console.log(e.message);
        directTo404(res)
    });

    req.on('data' , function(chunk){
        //以流的形式写入请求数据
        creq.write(chunk)
    }).on('end' , function(){
        console.log(urlObj.pathname+"：转发接口请求成功，等待服务器响应...");
        creq.end()
    })
}