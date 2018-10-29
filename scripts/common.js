/*设置windows的js代码*/
$(
    function () {
        var designWidth = 640;
        var remNum = 20;
        document.documentElement.style.fontSize = ((window.innerWidth / remNum) + 'px');
        window.alert = function(name){
            var iframe = document.createElement("IFRAME");
            iframe.style.display="none";
            iframe.setAttribute("src", 'data:text/plain,');
            document.documentElement.appendChild(iframe);
            window.frames[0].window.alert(name);
            iframe.parentNode.removeChild(iframe);
        };
    }
);
function stopPropagation(e) {
    if (e.stopPropagation) {
        e.stopPropagation();//非IE
    } else{
        e.cancelBubble = true;//ie
    }
}