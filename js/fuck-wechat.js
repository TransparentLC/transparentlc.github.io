// 禁止使用微信内置浏览器打开网页

!function (document) {

if (navigator.userAgent.toLowerCase().indexOf('micromessenger') === -1) return;

var body = document.body;
var div = document.createElement('div');
div.style.cssText = 'display:flex;justify-content:center;align-items:center;position:fixed;left:0;top:0;width:100%;height:100%;background-color:#fff;z-index:2147483647;padding:15px';

div.innerHTML = ''
  + '<div style="text-align:center;font-family:serif;max-width:540px">'
  +     '<div style="font-size:28px;font-weight:900;margin:25px 0">已停止访问该网页</div>'
  +     '<p>微信存在<strong>不合理的屏蔽</strong>行为，被多人投诉。<br>为维护<strong>自由</strong>上网环境，已停止来自微信的访问。</p>'
  +     '<p>你可以选择“在浏览器打开”，<br>或点击复制下面的网址使用浏览器访问。</p>'
  +     '<div id="link" style="border:1px solid #777;border-radius:3px;padding:7px">'
  +         location.href
  +     '</div>'
  + '</div>';

var link = div.querySelector('#link');
link.onclick = function () {
    var range = document.createRange();
    range.selectNodeContents(link);
    var selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('Copy');
    selection.removeAllRanges();
    alert('已复制');
}
body.innerHTML = '';
body.appendChild(div);

}(document)