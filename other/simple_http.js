// 用net模块简易实现http

var net = require("net");

var server = net.createServer(function(socket){

	socket.on('end', function(){
		console.log('disconnect!');
		socket.destroy();
	});

	socket.on('data', function(data){
		var body = "dsajiddasdddddddddddddddiasjdi";
		var len = Buffer.byteLength(body);

		var header = [
			'HTTP/1.1 200 OK',
			'Cache-Control: no-cache',
			'Connection: keep-alive',
			'Date: ' + (new Date()),
			'Content-Type: text/html;charset=utf-8',
			// 'Content-Length: ' + len,
			'Transfer-Encoding: chunked'
		].join('\r\n') + '\r\n\r\n';

		socket.setNoDelay(true);

		socket.write(header);

		// 如果transfer-encoding不为chunked，写数据则为直接socket.write
		// socket.write(body);

		// 如果transfer-encoding为chunked，写一段数据的格式为: 16进制长度 + \r\n + body + \r\n
		socket.write(len.toString(16) + '\r\n' + body + '\r\n', 'binary');
		socket.write(len.toString(16) + '\r\n' + body + '\r\n', 'binary');

		// 数据段写出完毕，则输出 0\r\n\r\n
		socket.write('0\r\n\r\n', 'binary');

		socket.end();
	});
}).listen(4000);

console.log("监听端口中")