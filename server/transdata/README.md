# transdata

数据转发工具

##Install

    npm install transdata

##Usage

post

    var transdata = require("transdata");
    var http = require("http");
    http.createServer(function(req , res){
        transdata.post({
            req:req,
            url:'http://XXX/XX:9000/getdata',
            res:res,
            success:function(){
                console.log("success");
            },
            error:function(e){
                console.log("error");
            }
        });
    })


get

    //也可以用上面那种对象模式
    transdata.get('http://XXXX.com/' , function(data){
        console.log(data)
    },function(e){
        console.log('error')
    })


    
    
