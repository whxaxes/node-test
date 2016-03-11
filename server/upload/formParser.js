/*
 *表单提交数据处理方法，只处理图片和文本提交
 */

var fs = require('fs');
var path = require('path');
var mimes = "image/jpeg,image/gif,image/png".split(",");
var exts = ".jpg,.gif,.png".split(",");

function FormParser(fileSaveDir) {
  this.recordLine = [];
  this.formDataArray = [];
  this.fileSaveDir = fileSaveDir;
  this.num = 0;
}

var fp = FormParser.prototype;

/*
 *重置数据
 */
fp.clear = function() {
  this.recordLine.length = 0;
  this.formDataArray.length = 0;
  this.num = 0;
};

/*
 *数据推入，用于req.on('data',function(){})中
 */
fp.push = function(chunk) {
  var recordLine = this.recordLine;
  var formDataArray = this.formDataArray;

  var start = 0, end = chunk.length;
  var fdata = formDataArray[formDataArray.length - 1];

  for (var i = 0; i < chunk.length; i++) {
    //逐行分析
    if (chunk[i] == 13 && chunk[i + 1] == 10) {
      var line = (new Buffer(recordLine)).toString();
      recordLine.length = 0;
      var matches;

      //如果匹配--------asdasdasd--这样的格式说明是formdata的起始或结束
      if (/-+[a-z0-9A-Z]+-*$/g.test(line)) {
        if (this.num > 0) {
          formDataEnd(chunk.slice(start, i - line.length - 2));

          if (fdata.ws) {
            fdata.ws.end();
            console.log("保存文件：" + fdata.path);
          } else {
            fdata.value = Buffer.concat(fdata.chunks || [], fdata.size).toString();
            console.log("接收文本内容：" + fdata.name + "=" + fdata.value);
          }
        }

        formDataArray.push(fdata = {});
        this.num = 0;
      } else if (matches = line.match(/([a-zA-Z0-9-]+)(?:=|:)\s?"?([\w/-]+)"?/g)) { //获取fdata的Content-Type等参数
        matches.forEach(function(m) {
          var spls = m.split(/:|=/);
          fdata[spls[0]] = spls[1].replace(/"|(^\s)/g, "");
        });
      }
      this.num++;

      if (!fdata) continue;

      //如果存在Content-Type说明是四行后才是数据起始，否则为3行后
      var contentType = fdata['Content-Type'],
        suffixIndex;
      if ((contentType && this.num == 4) || (!contentType && this.num == 3)) {
        start = i + 2;
        fdata.size = 0;
        //当ContentType为匹配mime里的类型时才创建文件流
        if (contentType && (suffixIndex = mimes.indexOf(contentType)) >= 0) {
          fdata.type = mimes[suffixIndex].split("/")[0];
          fdata.filename = +(new Date()) + ~~(Math.random() * 10000) + exts[suffixIndex];
          fdata.path = path.join(this.fileSaveDir, fdata.filename);
          fdata.ws = fs.createWriteStream(fdata.path);
        } else if (!contentType) {
          fdata.type = "text";
          fdata.chunks = [];
        }
      }
    } else if (recordLine.length < 100) {
      recordLine.push(chunk[i]);
    }
  }

  formDataEnd(chunk.slice(start, end));

  function formDataEnd(c) {
    if (!fdata.type)return;

    fdata.size += c.length;

    if (fdata.ws) {
      fdata.ws.write(c);
    } else {
      fdata.chunks.push(c);
    }
  }
};

module.exports = FormParser;