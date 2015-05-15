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

        that.send("连接成功");
    })
};

//获取数据信息
WebSocket.prototype.getDataStat = function (data) {
    var dataIndex = 2;  //数据索引，因为第一个字节和第二个字节肯定不为数据，所以初始值为2
    var secondByte = data[1];       //代表masked位和可能是payloadLength位的第二个字节
    var hasMask = secondByte >= 128; //如果大于或等于128，说明masked位为1
    secondByte -= hasMask ? 128 : 0;    //如果有掩码，需要将掩码那一位去掉

    var dataLength, maskedData;

    //如果为126，则后面16位长的数据为数据长度，如果为127，则后面64位长的数据为数据长度
    if (secondByte == 126) {
        dataIndex += 2;
        dataLength = data.readUInt16BE(2);
    } else if (secondByte == 127) {
        dataIndex += 8;
        dataLength = data.readUInt32BE(2) + data.readUInt32BE(6);
    } else {
        dataLength = secondByte;
    }

    //如果有掩码，则获取32位的二进制masking key，同时更新index
    if (hasMask) {
        maskedData = forMateBinary(data.readUInt32BE(dataIndex).toString(2));
        dataIndex += 4;
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
        result = [];
        var mi = 0;
        for (var i = stat.index; i < data.length; i++) {
            var k = forMateBinary(data.readUInt8(i).toString(2));
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
        result = data.slice(stat.index, data.length);
    }

    return result.toString();
};

WebSocket.prototype.send = function (message) {
    var length = Buffer.byteLength(message);

//  数据的起始位置，如果数据长度16位也无法描述，则用64位，即8字节，如果16位能描述则用2字节，否则用第二个字节描述
    var index = 2 + (length > 65535 ? 8 : (length > 125 ? 2 : 0));

//  定义buffer，长度为描述字节长度 + message长度
    var buffer = new Buffer(index + length);

//    假设当前帧就是最后一帧
    buffer[0] = parseInt("10000001" , 2);

//    因为是由服务端发至客户端，所以无需masked掩码
    if(length > 65535){
        buffer[1] = 127;

//        一般不会有太大的数据，此处直接用32位描述(因为buffer也只有写32位整型的方法)，其他置0
        buffer.writeUInt32BE(0 , 2);
        buffer.writeUInt32BE(length , 6);
    }else if(length > 125){
        buffer[1] = 126;

        buffer.writeUInt16BE(length , 2);
    }else {
        buffer[1] = length;
    }

//    写入正文
    buffer.write(message , index);

    this.socket.write(buffer);
};

//补全8位二进制数前面省略的0
function forMateBinary(data){
    var m = 8 - data.length % 8;
    if(m<8){
        for (var z = 0; z < m; z++) {
            data = "0"+data;
        }
    }
    return data;
}

module.exports = {
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

            socket.write(headers.join("\r\n") + "\r\n\r\n", 'ascii');

            new WebSocket(socket);
        });
    }
};