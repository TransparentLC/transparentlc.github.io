(document => {

// if (navigator.userAgent.toLowerCase().indexOf('micromessenger') === -1) return;

const linkId = `fuck-wechat-${Math.random().toString(16).slice(2, 10)}`;
document.body.innerHTML = ''
    + `<div style="display:flex;justify-content:center;align-items:center;flex-direction:column;position:fixed;left:0;top:0;width:100%;height:100%;background-color:#fff;z-index:2147483647;padding:15px;box-sizing:border-box;font-family:serif">`
    +     `<div style="max-width:540px">`
    +         `<div style="font-size:28px;font-weight:900;margin:25px 0;text-align:center">已停止访问该网页</div>`
    +         `<p>微信存在<strong>不合理的屏蔽和审查</strong>行为，被多人投诉。为维护<strong>自由</strong>上网环境，已停止来自微信的访问。</p>`
    +         `<p>你可以选择“在浏览器打开”，或点击复制下面的网址使用浏览器访问。</p>`
    +     `</div>`
    +     `<div id="${linkId}" style="border:1px solid #777;border-radius:3px;padding:7px;width:100%;max-width:540px;margin:0 auto;box-sizing:border-box;white-space:nowrap;overflow-x:auto;text-align:center">${location.href}</div>`
    + `</div>`;

const link = document.getElementById(linkId);
link.onclick = () => {
    const range = document.createRange();
    range.selectNodeContents(link);
    const selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('Copy');
    selection.removeAllRanges();
    alert('已复制');
};

})(document)