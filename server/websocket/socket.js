"use strict";
var crypto = require("crypto");
var util = require("util");
var EventEmitter = require("events").EventEmitter;
var webSocketCollector = [];

function WebSocket(socket) {
    this.state = "OPEN";
    this.pingTimes = 0;
    this.socket = socket;

    this.datas = [];

    this.bind();
    //this.checkHeartBeat();
}

util.inherits(WebSocket, EventEmitter);

WebSocket.prototype.bind = function () {
    var that = this;
    this.socket.on('data', function (data) {
        that.dataHandle(data);
    });
};

//获取数据信息
WebSocket.prototype.handleDataStat = function (data) {
    if (!this.stat) {
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
            maskedData = data.slice(dataIndex, dataIndex + 4);
            dataIndex += 4;
        }

        //数据量最大为10kb
        if (dataLength > 10240) {
            this.send("Warning : data limit 10kb");
        } else {
            //计算到此处时，dataIndex为数据位的起始位置，dataLength为数据长度，maskedData为二进制的解密数据
            this.stat = {
                index: dataIndex,
                totalLength: dataLength,
                length: dataLength,
                maskedData: maskedData,
                opcode: parseInt(data[0].toString(2).substring(4, 8), 2)   //获取第一个字节的opcode位
            };
        }
    } else {
        this.stat.index = 0;
    }
};

//解析数据
WebSocket.prototype.dataHandle = function (data) {
    this.handleDataStat(data);
    var stat;

    if (!(stat = this.stat)) return;

    if (stat.opcode === 9 || stat.opcode === 10) {
        (stat.opcode === 9) ? (this.sendPong()) : (this.pingTimes = 0);
        this.reset();
        return;
    }

    var result;
    if (stat.maskedData) {
        result = [];
        for (var i = stat.index, mi = 0; i < data.length; i++, mi++) {
            //对数据进行异或运算，然后转成16进制储存
            result.push("0x" + (data[i] ^ stat.maskedData[mi % 4]).toString(16));
        }
        result = new Buffer(result);
    } else {
        result = data.slice(stat.index, data.length);
    }

    this.datas.push(result);

    stat.length -= (data.length - stat.index);

    //当长度为0，则说明到了最后的数据
    if (stat.length == 0) {
        var buf = Buffer.concat(this.datas, stat.totalLength);

        if (stat.opcode == 8) {
            this.close(buf.toString());
        } else {
            this.emit("message", buf.toString());
        }

        this.reset();
    }
};

WebSocket.prototype.reset = function () {
    this.stat = null;
    this.datas.length = 0;
};

WebSocket.prototype.close = function (reason) {
    this.emit('close', reason);
    this.state = "CLOSE";
    this.socket.destroy();
    var index = webSocketCollector.indexOf(this);
    webSocketCollector.splice(index, 1);
};

//每隔10秒进行一次心跳检测，若连续发出三次心跳却没收到响应则关闭socket
WebSocket.prototype.checkHeartBeat = function () {
    var that = this;
    setTimeout(function () {
        if (that.state !== "OPEN") return;

        if (that.pingTimes >= 3) {
            that.close("time out");
            return;
        }

        //记录心跳次数
        that.pingTimes++;
        that.sendPing();

        that.checkHeartBeat();
    }, 10000);
};
WebSocket.prototype.sendPing = function () {
    this.socket.write(new Buffer(['0x89', '0x0']))
};
WebSocket.prototype.sendPong = function () {
    this.socket.write(new Buffer(['0x8A', '0x0']))
};

//数据发送
WebSocket.prototype.send = function (message) {
    message = String(message);
    var length = Buffer.byteLength(message);

//  数据的起始位置，如果数据长度16位也无法描述，则用64位，即8字节，如果16位能描述则用2字节，否则用第二个字节描述
    var index = 2 + (length > 65535 ? 8 : (length > 125 ? 2 : 0));

//  定义buffer，长度为描述字节长度 + message长度
    var buffer = new Buffer(index + length);

//  第一个字节，fin位为1，opcode为1
    buffer[0] = 129;

//    因为是由服务端发至客户端，所以无需masked掩码
    if (length > 65535) {
        buffer[1] = 127;

//        一般不会有太大的数据，此处直接用32位描述(因为buffer也只有写32位整型的方法)，其他置0
        buffer.writeUInt32BE(0, 2);
        buffer.writeUInt32BE(length, 6);
    } else if (length > 125) {
        buffer[1] = 126;

        buffer.writeUInt16BE(length, 2);
    } else {
        buffer[1] = length;
    }

//    写入正文
    buffer.write(message, index);

    this.socket.write(buffer);
};

module.exports = {
    getList: function () {
        return webSocketCollector.slice(0);
    },

    brocast: function (msg) {
        webSocketCollector.forEach(function (ws) {
            if (ws && ws.state == "OPEN") {
                ws.send(msg);
            }
        })
    },

    update: function (server, callback) {
        server.on('upgrade', function (req, socket, upgradeHead) {
            var key = req.headers['sec-websocket-key'];
            key = crypto.createHash("sha1").update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
            var headers = [
                'HTTP/1.1 101 Switching Protocols',
                'Upgrade: websocket',
                'Connection: Upgrade',
                'Sec-WebSocket-Accept: ' + key
            ];
            socket.setNoDelay(true);
            socket.write(headers.join("\r\n") + "\r\n\r\n", 'ascii');

            var ws = new WebSocket(socket);
            webSocketCollector.push(ws);
            callback(ws);
        });
    }
};