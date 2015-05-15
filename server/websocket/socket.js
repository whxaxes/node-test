var crypto = require("crypto");

function WebSocket(socket) {
    this.socket = socket;
    this.bind()
}

WebSocket.prototype.bind = function () {
    var that = this;
    this.socket.on('data', function (data) {
        data = that.dataHandle(data);

        console.log("接受到的数据为：" + data);
    })
};

//获取数据信息
WebSocket.prototype.getDataStat = function (data) {
    var dataIndex = 2;  //数据索引，因为第一个字节和第二个字节肯定不为数据，所以初始值为2
    var secondByte = data[1];       //代表masked位和可能是payloadLength位的第二个字节
    var hasMask = secondByte >= 128; //如果大于或等于128，说明masked位为1
    secondByte -= hasMask ? 128 : 0;    //如果有掩码，需要将掩码那一位去掉

    var dataLength, maskedData;

    //如果为126，则后面16位长的数据为数据长度，如果为127，则后面32位长的数据为数据长度
    if (secondByte == 126) {
        dataIndex += 2;
        dataLength = data[2] + data[3];
    } else if (secondByte == 127) {
        dataIndex += 4;
        dataLength = data[2] + data[3] + data[4] + data[5];
    } else {
        dataLength = secondByte;
    }

    //如果有掩码，则获取masking key
    if (hasMask) {
        var i = dataIndex;
        dataIndex += 4;    //如果有掩码，则有32位为masking key

        maskedData = "";
        for (; i < dataIndex; i++) {
            maskedData += getBinary(data[i]);
        }
    }

    //计算到此处时，dataIndex为数据位的起始位置，dataLength为数据长度，maskedData为二进制的解密数据
    return {
        index: dataIndex,
        length: dataLength,
        maskedData: maskedData
    };
};

//解析数据
WebSocket.prototype.dataHandle = function (data) {
    var stat = this.getDataStat(data);
    var result;
    if (stat.maskedData) {
        console.log('has masking key');
        result = [];
        var mi = 0;
        for (var i = stat.index; i < data.length; i++) {
            var k = getBinary(data[i]);
            var b = "";

            //对数据进行解密，与masking key 进行异或运算
            for (var j = 0; j < 8; j++) {
                var nm = stat.maskedData.charAt(mi);
                b += k.charAt(j) ^ nm;
                mi = (mi + 1) >= 32 ? 0 : (mi + 1);
            }

            result.push("0x" + parseInt(b, 2).toString(16));
        }
        result = new Buffer(result);
    } else {
        console.log('no masking key')
        result = data.slice(stat.index, data.length);
    }

    return result.toString();
};

WebSocket.prototype.send = function (message) {
    //var buf = new Buffer(Buffer.byteLength(message));

    //buf.write()
    var length = Buffer.byteLength(message);
    var array = [];

    array[0] = "0x" + parseInt("10000001" , 2).toString(16);
    array[1] = "0x" + length.toString(16);
};

//将16进制转成2进制
function getBinary(str) {
    str = str.toString(2);
    for (var k = 0; k < 8; k++) {
        if (!str.charAt(k)) {
            str = "0" + str;
        }
    }
    return str;
}

module.exports = {
    handle: function (req, res, pathname) {

    },

    update: function (server) {
        server.on('upgrade', function (req, socket, upgradeHead) {
            var head = new Buffer(upgradeHead.length);
            upgradeHead.copy(head);

            var key = req.headers['sec-websocket-key'];
            key = crypto.createHash("sha1").update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
            var headers = [
                'HTTP/1.1 101 Switching Protocols',
                'Upgrade: websocket',
                'Connection: Upgrade',
                'Sec-WebSocket-Accept: ' + key
            ];

            //socket.setNoDelay(true);
            socket.write(headers.join("\r\n") + "\r\n\r\n", 'ascii');

            new WebSocket(socket);
            //ws.send("hello");
        });
    }
};