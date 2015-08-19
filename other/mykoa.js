//简易实现koa的中间件效果

var gens = [];

function use(generetor){
    gens.push(generetor);
}

function trigger(){
    var index = 0;
    var ne = {};
    var gs = [],
        g;

    next();

    function next(){
        //获取当前中间件，传入next标记，即当yield next时处理下一个中间件
        var gen = gens[index](ne);

        //保存实例化的中间件
        gs.push(gen);

        co(gen)
    }

    function co(gen, data){
        if(!gen) return;

        var result = gen.next(data);

        // 当当前的generator中间件执行完毕，将执行索引减一，获取上一级的中间件并且执行
        if(result.done){
            index--;

            if(g = gs[index]){
                co(g);
            }

            return;
        }

        // 如果执行到Promise，则当Promise执行完毕再进行递归
        if(result.value instanceof Promise){
            result.value.then(function(data){
                co(gen, data);
            })
        }else if(result.value === ne){
            // 当遇到yield next时，执行下一个中间件
            index++;

            next();
        }else {
            co(gen);
        }
    }
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
});

use(function*(){
    var d = yield new Promise(function(resolve){
        setTimeout(function(){
            resolve("step5")
        }, 1000)
    });

    console.log(d);

    console.log("step6");
});

trigger();