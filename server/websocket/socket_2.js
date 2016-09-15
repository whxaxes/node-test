/**
 * websocket简易封装
 */

'use strict';

const EventEmitter = require("events").EventEmitter;

var webSocketCollector = [];

// 创建WebSocket类并继承事件类
class WebSocket extends EventEmitter {
  constructor(socket) {
    super();

    this.state = "OPEN";

    this.pingTimes = 0;

    this.socket = socket;

    this.receiver = null;

    this.bind();

    this.checkHeartBeat();

    Object.defineProperty(this, 'connectLength', {
      get: function() {
        return webSocketCollector.length;
      }
    });

    webSocketCollector.push(this);
  }

  /**
   * 关闭链接
   * @return {[type]}
   */
  close(reason) {
    var index;

    if (this.state === "CLOSE") return;

    if ((index = webSocketCollector.indexOf(this)) + 1) {
      webSocketCollector.splice(index, 1);
    }

    this.emit('close', reason);

    this.state = "CLOSE";

    this.socket.destroy();
  }

  /**
   * 广播信息
   * @param  {String} message
   */
  brocast(message) {
    webSocketCollector.forEach(function(ws) {
      ws.send(message);
    });
  }

  /**
   * 对socket进行事件绑定
   */
  bind() {
    var that = this;

    this.socket.on('data', function(data) {
      that.dataHandle(data);
    });

    this.socket.on('close', function(e) {
      that.close(e);
    });

    this.socket.on('error', function(e) {
      that.close(e);
    });
  }

  /**
   * socket有数据过来的处理
   * @return {[type]}
   */
  dataHandle(data) {
    var receiver = this.receiver;

    if (!receiver) {
      receiver = decodeFrame(data);

      if (receiver.opcode === 8) { // 关闭码
        this.close(new Error("client closed"));
        return;
      } else if (receiver.opcode === 9) { // ping码
        this.sendPong();
        return;
      } else if (receiver.opcode === 10) { // pong码
        this.pingTimes = 0;
        return;
      }

      this.receiver = receiver;

    } else {
      // 将新来的数据跟此前的数据合并
      receiver.payloadData = Buffer.concat(
        [receiver.payloadData, data],
        receiver.payloadData.length + data.length
      );

      // 更新数据剩余数
      receiver.remains -= data.length;
    }

    // 如果无剩余数据，则将receiver置为空
    if (receiver.remains <= 0) {
      receiver = parseData(this.receiver);

      this.emit('message', receiver);

      this.receiver = null;
    }
  }

  /**
   * 发送数据
   * @param  {String} message 发送的信息
   * @return {[type]}
   */
  send(message) {
    if (this.state !== "OPEN" && this.socket.writable) return;

    this.socket.write(encodeFrame(message));
  }

  /**
   * 心跳检测
   */
  checkHeartBeat() {
    var that = this;
    setTimeout(function() {
      if (that.state !== "OPEN") return;

      // 如果连续3次未收到pong回应，则关闭连接
      if (that.pingTimes >= 3) {
        that.close("time out");
        return;
      }

      //记录心跳次数
      that.pingTimes++;
      that.sendPing();

      that.checkHeartBeat();
    }, 20000);
  }

  /**
   * 发送ping
   */
  sendPing() {
    this.socket.write(new Buffer(['0x89', '0x0']))
  }

  /**
   * 发送pnong
   */
  sendPong() {
    this.socket.write(new Buffer(['0x8A', '0x0']))
  }
}

/**
 * 对数据进行解码
 * @param  {Buffer} data 传过来的data
 * @return {Object}
 */
function decodeFrame(data) {
  var dataIndex = 2; //数据索引，因为第一个字节和第二个字节肯定不为数据，所以初始值为2
  var fin = data[0] >> 7; //获取fin位，因为是第一位，所以8位二进制往后推7位
  var opcode = data[0] & parseInt(1111, 2); //获取第一个字节的opcode位，与00001111进行与运算
  var masked = data[1] >> 7; //获取masked位，因为是第一位，所以8位二进制往后推7位
  var payloadLength = data[1] & parseInt(1111111, 2); //获取数据长度，与01111111进行与运算
  var maskingKey,
    payloadData,
    remains = 0;

  //如果为126，则后面16位长的数据为数据长度，如果为127，则后面64位长的数据为数据长度
  if (payloadLength == 126) {
    dataIndex += 2;
    payloadLength = data.readUInt16BE(2);
  } else if (payloadLength == 127) {
    dataIndex += 8;
    payloadLength = data.readUInt32BE(2) + data.readUInt32BE(6);
  }

  //如果有掩码，则获取32位的二进制masking key，同时更新index
  if (masked) {
    maskingKey = data.slice(dataIndex, dataIndex + 4);
    dataIndex += 4;
  }

  // 解析出来的数据
  payloadData = data.slice(dataIndex, dataIndex + payloadLength);

  // 剩余字节数
  remains = dataIndex + payloadLength - data.length;

  return {
    fin,
    opcode,
    masked,
    maskingKey,
    remains,
    payloadData
  }
}

/**
 * 解析接收到的数据，如果有maskingKey则进行异或运算
 * @param  {Object} receiver 为decodeFrame返回的参数
 * @return {String} 解析后得到的数据
 */
function parseData(receiver) {
  var result;

  if (receiver.maskingKey) {
    result = new Buffer(receiver.payloadData.length);
    for (var i = 0; i < receiver.payloadData.length; i++) {
      //对每个字节进行异或运算，masked是4个字节，所以%4，借此循环
      result[i] = receiver.payloadData[i] ^ receiver.maskingKey[i % 4];
    }
  }

  result = (result || receiver.payloadData).toString();

  return result;
}

/**
 * 对要发送的数据进行编码
 * @param  {String} message 要发送的数据
 * @return {Buffer}
 */
function encodeFrame(message) {
  message = String(message);
  var length = Buffer.byteLength(message);

  if (!length) return;

  //数据的起始位置，如果数据长度16位也无法描述，则用64位，即8字节，如果16位能描述则用2字节，否则用第二个字节描述
  var index = 2 + (length > 65535 ? 8 : (length > 125 ? 2 : 0));

  //定义buffer，长度为描述字节长度 + message长度
  var buffer = new Buffer(index + length);

  //第一个字节，fin位为1，opcode为1
  buffer[0] = 129;

  //因为是由服务端发至客户端，所以无需masked掩码
  if (length > 65535) {
    buffer[1] = 127;

    //长度超过65535的则由8个字节表示，4个字节能表达的长度为4294967295，直接将前面4个字节置0
    buffer.writeUInt32BE(0, 2);
    buffer.writeUInt32BE(length, 6);
  } else if (length > 125) {
    buffer[1] = 126;

    //长度超过125的话就由2个字节表示
    buffer.writeUInt16BE(length, 2);
  } else {
    buffer[1] = length;
  }

  //写入正文
  buffer.write(message, index);

  return buffer;
}

module.exports = WebSocket;