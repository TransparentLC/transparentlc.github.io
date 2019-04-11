//为使用（存在作恶行为的）国产浏览器的访问者显示弹窗提示
//UA片段来自于网络，可能存在偏差或漏网之鱼
//小透明・宸 2019.4.19

var evilBrowserDetected = false;
var evilBrowserUAList = [
    'UCBrowser', 'UBrowser', 'UCWEB', //UC浏览器
    'BIDUBrowser', 'baidubrowser', //百度浏览器
    'baiduboxapp', 'BaiduHD', //手机百度
    'MicroMessenger', //微信
    'QQBrowser', //QQ浏览器
    '360SE', //360安全浏览器
    '360EE', //360极速浏览器
    '360 Aphone Browser', //360手机浏览器
    'MetaSr', 'SogouMobileBrowser', 'SogouSearch', //搜狗浏览器
    'LieBaoFast', 'LBBROWSER', //猎豹浏览器
    '2345chrome', '2345explorer', 'Mb2345Browser', //2345浏览器
    'MiuiBrowser', //小米手机内置浏览器
    'OppoBrowser' //OPPO手机内置浏览器
];

for (var i = 0; i < evilBrowserUAList.length; i++) {
    if (navigator.userAgent.indexOf(evilBrowserUAList[i]) !== -1) {
        evilBrowserDetected = true;
        break;
    }
}

if (evilBrowserDetected) {
    var div = document.createElement('div');
    div.setAttribute('id', 'fuckEvilBrowser')
    var style = document.createAttribute('style');
    div.setAttributeNode(style);
    div.style.position = 'fixed';
    div.style.left = '0';
    div.style.top = '0';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.overflowY = 'auto';
    div.style.textAlign = 'center';
    div.style.color = '#262626';
    div.style.backgroundColor = '#f2f2f2';
    div.style.fontSize = '14px';
    div.style.lineHeight = '1.5em';
    div.style.zIndex = '2147483647';
    div.innerHTML = [
        '<div style="margin: 0 auto; max-width: 480px; padding: 15px;">',
        '    <div style="font-size: 36px; margin-top: 36px; margin-bottom: 36px; line-height: 1.25em;">',
        '        (っ\'-\')╮',
        '        <br />',
        '        已停止访问该网页',
        '    </div>',
        '    <div style="text-align: left;">',
        '        <p>本站<strong>强烈不建议</strong>使用<strong>国产浏览器</strong>访问。</p>',
        '        <p>部分国产浏览器存在<a href="https://www.zhihu.com/question/318459753/answer/641027942" style="color: #3e7ac2; text-decoration: none;">恶意屏蔽</a>和<a href="https://zhuanlan.zhihu.com/p/33949949" style="color: #3e7ac2; text-decoration: none;">植入广告</a>等行为，严重破坏自由上网环境。</p>',
        '        <p>推荐使用以下任意一种现代浏览器以享受自由、干净、安全的浏览体验。</p>',
        '    </div>',
        '    <div style="display: flex; flex-wrap: wrap; ">',
        '        <div style="width: 100%; display: flex; flex-direction: row; align-items: center;" id="chrome">',
        '            <img src="https://cdn.jsdelivr.net/npm/@browser-logos/chrome@1.0.8/chrome.svg" alt="chrome-logo" width="48" height="48" />',
        '            <div style="text-align: left; margin-left: 12px;">',
        '                Google Chrome',
        '                <br />',
        '                由 Google 开发的浏览器。&nbsp;<a href="https://www.google.cn/chrome/browser/desktop/index.html" style="color: #3e7ac2; text-decoration: none;">立即下载</a>',
        '            </div>',
        '        </div>',
        '        <div style="width: 100%; display: flex; flex-direction: row; align-items: center; margin-top: 12px;" id="firefox">',
        '            <img src="https://cdn.jsdelivr.net/npm/@browser-logos/firefox@2.0.2/firefox.svg" alt="firefox-logo" width="48" height="48" />',
        '            <div style="text-align: left; margin-left: 12px;">',
        '                Mozilla Firefox',
        '                <br />',
        '                自由开源的网页浏览器。&nbsp;<a href="https://www.mozilla.org/zh-CN/firefox/new/" style="color: #3e7ac2; text-decoration: none;">立即下载</a>',
        '            </div>',
        '        </div>',
        '        <div style="width: 100%; display: flex; flex-direction: row; align-items: center; margin-top: 12px;" id="edge">',
        '            <img src="https://cdn.jsdelivr.net/npm/@browser-logos/edge@1.0.5/edge.svg" alt="edge-logo" width="48" height="48" />',
        '            <div style="text-align: left; margin-left: 12px;">',
        '                Microsoft Edge',
        '                <br />',
        '                Windows 10 的默认浏览器。',
        '            </div>',
        '        </div>',
        '        <div style="width: 100%; display: flex; flex-direction: row; align-items: center; margin-top: 12px;" id="safari">',
        '            <img src="https://cdn.jsdelivr.net/npm/@browser-logos/safari@1.0.4/safari_128x128.png" alt="safari-logo" width="48" height="48" />',
        '            <div style="text-align: left; margin-left: 12px;">',
        '                Safari',
        '                <br />',
        '                iOS 的默认浏览器。',
        '            </div>',
        '        </div>',
        '        <div id="febContinue" style="width: 100%; text-align: center; background-color: #5f8cc2; color: rgba(255, 255, 255, 0.8); height: 36px; line-height: 36px; border-radius: 4px; user-select: none !important; -moz-user-select: none !important; -webkit-user-select: none !important; -ms-user-select: none !important; margin-top: 12px;">',
        '            仍然访问&nbsp;<span id="febContinueCountdown"></span>',
        '        </div>',
        '    </div>',
        '</div>'
    ].join('\n');

    document.getElementsByTagName('body')[0].appendChild(div);

    var febContinue = document.getElementById('febContinue');
    var febContinueCountdown = document.getElementById('febContinueCountdown');


    var countDown = 5;
    febContinueCountdown.innerText = '(' + countDown + ')';
    var interval = setInterval(function () {
        countDown--;
        febContinueCountdown.innerText = '(' + countDown + ')';
        if (!countDown) {
            clearInterval(interval);

            febContinue.style.backgroundColor = '#3e7ac2';
            febContinue.style.color = '#fff';
            febContinue.style.cursor = 'pointer';
            febContinueCountdown.innerText = '';

            febContinue.addEventListener('touchstart', function () {
                febContinue.style.backgroundColor = '#5f8cc2';
                febContinue.style.color = 'rgba(255, 255, 255, 0.8)';
            });
            febContinue.addEventListener('mousedown', function () {
                febContinue.style.backgroundColor = '#5f8cc2';
                febContinue.style.color = 'rgba(255, 255, 255, 0.8)';
            });
            document.addEventListener('touchend', function () {
                febContinue.style.backgroundColor = '#3e7ac2';
                febContinue.style.color = '#fff';
            });
            febContinue.addEventListener('mouseup', function () {
                febContinue.style.backgroundColor = '#3e7ac2';
                febContinue.style.color = '#fff';
            });

            febContinue.onclick = function () {
                document.body.removeChild(document.getElementById('fuckEvilBrowser'));
            }
        }
    }, 1000);
}