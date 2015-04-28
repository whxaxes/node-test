var child_process = require("child_process");

spawn("./app.js");

function spawn(nodePath){
    var child = child_process.spawn("node" , [nodePath]);

    child.on("exit" , function (code, sign) {
        if(code !== 0){
            console.log("进程出错");

            setTimeout(function(){
                console.log("重启进程");
                spawn(nodePath);
            } , 2000)
        }
    }).on('error' , function(err){
        console.log(err);
    });

    child.stdout.setEncoding("utf8");
    child.stdout.on('data' , function(data){
        console.log(data)
    });

    child.stderr.setEncoding("utf8");
    child.stderr.on('data' , function(data){
        console.log(data)
    });
}