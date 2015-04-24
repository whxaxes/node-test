var transdata = require('../');
var fs = require("fs");

var rb = fs.createReadStream("./data.txt");
var wb = fs.createWriteStream("./result.txt");

describe("check post" , function(){
    it("use stream and should run the callback without error" , function(done){
        transdata.post({
            req:rb,
            url:'http://xxzs.9game.cn:9020/game.getGameAdPositions',
            res:wb,
            success:function(){
                done();
            },
            error:function(e){
                throw e;
            }
        });
    });

    it("use string and should run the callback without error" , function(done){
        transdata.post({
            req:'{"sign":"60e6b361178618c597b02b49b9c47968","id":"1408432939493","client":{"caller":"xxzsassmdv","ex":"{}"},"encrypt":"md5","data":{"channelId":100005753,"requestType":"JPJJC"}}',
            url:'http://xxzs.9game.cn:9020/game.getGameAdPositions',
            success:function(data){
                if(data){
                    done();
                }else {
                    throw new Error("no data")
                }
            },
            error:function(e){
                throw e;
            }
        });
    })
});

describe("check get" , function(){
    it("should run the callback without error" , function(done){
        transdata.get('http://www.xxzs.tv/' , function(data){
            done()
        },function(e){
            throw e;
        });
    })
});