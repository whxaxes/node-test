'use strict';
const fs = require('fs');
const path = require('path');
const router = require('../router');

router.setMap("bigpipe", function(req, res) {
  //bigpipe测试
  res.writeHead(200, {
    'Content-Type': 'text/html;charset=utf-8'
  });

  const html = fs.readFileSync(path.join(__dirname, "./head.html")).toString();

  let i = 0;
  res.write(html);

  setTimeout(function() {
    //先加载js文件
    res.write(fs.readFileSync(path.join(__dirname, "./script.html")).toString());

    //然后开始加载各个page的内容
    flush();
  }, 100);

  function flush() {
    if (i >= 4) {
      res.end("</body></html>");
      return;
    }

    setTimeout(() => {
      res.write(
        `<script class='element' data-id='dom${i}' type='text/template'>
          ${fs.readFileSync(path.join(__dirname, "./manyValue.html")).toString()}
        </script>`
      );

      i++;
      flush();
    }, 1000)
  }
});