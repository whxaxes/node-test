//简易实现koa的中间件效果
var gens = [];

function use(generetor){
    gens.push(generetor);
}

// 实现co函数
function co(flow, isGenerator){
    var gen;

    if (isGenerator) {
        gen = flow;
    } else {
        gen = flow();
    }

    return new Promise(function(resolve){
        var next = function(data){
            var result = gen.next(data);
            var value = result.value;

            // 如果调用完毕，调用resolve
            if(result.done){
                resolve(value);
                return;
            }

            // 如果为yield后面接的为generator，传入co进行递归，并且将promise返回
            if (typeof value.next === "function" && typeof value.throw === "function") {
                value = co(value, true);
            }

            if(value.then){
                // 当promise执行完毕，调用next处理下一个yield
                value.then(function(data){
                    next(data);
                })
            }
        };

        next();
    });

}

function trigger(){
    var prev = null;
    var m = gens.length;
    co(function*(){
        while(m--){
            // 形成链式generator
            prev = gens[m].call(null, prev);
        }

        // 执行最外层generator方法
        yield prev;
    })
}


// test
use(function*(next){
    var d = yield new Promise(function(resolve){
        setTimeout(function(){
            resolve("step1")
        }, 1000)
    });

    console.log(d);

    yield next;

    console.log("step2");
});

use(function*(next){
    console.log("step3");

    yield next;

    var d = yield new Promise(function(resolve){
        setTimeout(function(){
            resolve("step4")
        }, 1000)
    });

    console.log(d);

    yield next;

    console.log(d);
});

use(function*(next){
    var d = yield new Promise(function(resolve){
        setTimeout(function(){
            resolve("step5")
        }, 1000)
    });

    console.log(d);

    console.log("step6");
});

trigger();