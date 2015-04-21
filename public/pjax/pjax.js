!function(w){
    var history = w.history;
    var $li = $(".choose li");
    var $title = $("title");
    var $contents = $(".contents");
    var cache = {};

    cache[$li.index($(".choose .on"))] = $contents.html();

    $li.click(function(e){
        if($(this).hasClass("on")) return false;

        if('pushState' in history){
            e.preventDefault();

            var state = {
                num:$li.index($(".choose .on")),
                url:w.location.href
            };

            if(!history.state){
                history.replaceState(state,'');
            }

            state.num = $li.index($(this));
            state.url = $(this).find("a").attr("href");

            history.pushState(state,'',state.url);
            stateChange(state)
        }
    });

    if('pushState' in history){
        w.onpopstate = function(e){
            stateChange(e.state);
        }
    }

    function stateChange(state){
        switch (state.num){
            case 0:$title.html("pjax1");break;
            case 1:$title.html("pjax2");break;
            case 2:$title.html("pjax3");break;
        }

        $li.eq(state.num).addClass("on").siblings().removeClass("on");
        if(state.num in cache){
            $contents.html(cache[state.num]);
            return;
        }

        $contents.html("loading...");

        //var xhr = w.XMLHttpRequest?(new XMLHttpRequest()):(new ActiveXObject("Microsoft.XMLHTTP"));
        //xhr.open('get' , state.url , true);
        //xhr.setRequestHeader('pjax' , 'true');
        //xhr.send(null);
        //xhr.onreadystatechange = function(){
        //    if(xhr.readyState == 4){
        //        if(xhr.status == 200 && history.state.num == state.num){
        //            $contents.html(xhr.responseText);
        //        }
        //    }
        //}

        $.ajax({
            type:'GET',
            url:state.url,
            success:function(text){
                cache[state.num] = text;
                if(history.state.num==state.num){
                    $contents.html(text);
                }
            },
            error:function(){
                if(history.state.num==state.num){
                    $contents.html("load fail");
                }
            },
            headers:{'pjax' : 'true'}
        })
    }
}(window);