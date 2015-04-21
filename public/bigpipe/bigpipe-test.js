var now = 0;
var loop = setInterval(function(){
    var $els = $(".element");
    $els.each(function(){
        if($(this).html()){
            var $eim = $("#" + $(this).attr("data-id"));
            $eim.find(".value").html($(this).html());
            document.body.removeChild(this);
            now++;
        }
    })

    if(now == $(".page").length){
        clearInterval(loop);
    }
},200);