var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var baseDir = __dirname + PATH_LINE;

module.exports = function(req , res , urlObj){
    var pathname = urlObj.pathname;
    var filename = pathname.substring(pathname.lastIndexOf("/")+1 , pathname.length);

    try{
        var text = fs.readFileSync(baseDir + filename);
    }catch(e){
        console.log(e);
        directTo404(res);
        return false;
    }

    if(req.headers['pjax']){
        var $ = cheerio.load(text);
        text = $(".contents").html();
    }

    res.write(text);
    res.end();
};