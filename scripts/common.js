/*设置windows的js代码*/
$(
    function () {
        var designWidth = 640;
        var designHeight=1136-260;
        var remNum = 20;
        document.documentElement.style.fontSize = ((window.innerWidth / remNum) + 'px');
        $('.body').css('height',designHeight/32+"rem");
    }
);
function stopPropagation(e) {
    if (e.stopPropagation) {
        e.stopPropagation();//非IE
    } else{
        e.cancelBubble = true;//ie
    }
}