var fs = require("fs");

//在fs.readFile的回调中插入逻辑
var helper = function(fn){
    return function(){
        var args = [].slice.call(arguments);
        var pass;

        args.push(function(){
            // 执行自定义逻辑
            if(pass){
                pass.apply(null, arguments);
            }
        });

        fn.apply(null, args);

        // 插入自定义逻辑
        return function(fn){
            pass = fn;
        }
    }
};

var readFile = helper(fs.readFile);

// co简易实现
function co(generator){
    var gen = generator();

    var next = function(data){
        var result = gen.next(data);

        if(result.done) return;

        if (result.value instanceof Promise) {
            result.value.then(function (d) {
                next(d);
            }, function (err) {
                next(err);
            })
        } else if (typeof result.value === "function") {
            result.value(function (err, data) {
                next(data);
            })
        }
    };

    next();
}

// co简易实现
function _co(generator){
    var gen = generator();

    var next = function(data){
        var result = gen.next(data);

        if(result.done) return;

        if (result.value instanceof Promise) {
            result.value.then(function (d) {
                next(d);
            }, function (err) {
                next(err);
            })
        } else if (typeof result.value === "function") {
            result.value(function (err, data) {
                next(data);
            })
        }
    };

    next();
}

// test
co(function*(){
    var text1 = yield new Promise(function(resolve){
        setTimeout(function(){
            resolve("I am text1");
        }, 1000);
    });

    console.log(text1);

    yield new Promise(function(resolve){
        setTimeout(function(){
            resolve(true);
        }, 1000);
    });

    var text2 = yield readFile('./README.md', 'utf8');

    console.log(text2);
});