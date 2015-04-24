var transdata = require('./transdata');
//
//transdata.post({
//    req:'{"sign":"37afa65b0d85881ca93bd4b3c423d47f","id":"1408432939493","client":{"caller":"xxzsassmdv","ex":"{}"},"encrypt":"md5","data":{"channelId":100006389,"requestType":"JPJJC"}}',
//    url:'http://localhost:9261/game.getGameAdPositions',
//    success:function(data){
//        console.log(data)
//    }
//});
transdata.get('http://localhost:9261/' , function(data){
    console.log(data)
})