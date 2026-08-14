(document => {

/**
 * @param {String} label
 * @param {String} message
 * @param {String} color
 */
const consoleBadge = (label, message, color) => console.log(
    `%c ${label} %c ${message} `,
    'color:#fff;background-color:#555;border-radius:3px 0 0 3px',
    `color:#fff;background-color:${color};border-radius:0 3px 3px 0`,
);

consoleBadge('Project', 'hexo-theme-akarin', '#07c');
consoleBadge('Author', 'TransparentLC', '#f84');
consoleBadge('Source', 'https://github.com/TransparentLC/hexo-theme-akarin', '#4b1');

// ****************
// 懒加载组件
// ****************

const imageSourceFormats = new Set(['jpeg', 'png', 'gif', 'svg+xml', 'webp']);
const imageSourceFormatsCheck = Promise.all([
    // ['webp', 'data:image/webp;base64,UklGRhIAAABXRUJQVlA4TAYAAAAvQWxvAGs'],
    ['avif', 'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZgAAAOltZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAAA5waXRtAAAAAAABAAAAHmlsb2MAAAAARAAAAQABAAAAAQAAAQ0AAAAVAAAAKGlpbmYAAAAAAAEAAAAaaW5mZQIAAAAAAQAAYXYwMUNvbG9yAAAAAGhpcHJwAAAASWlwY28AAAAUaXNwZQAAAAAAAAABAAAAAQAAAA5waXhpAAAAAAEIAAAADGF2MUOBABwAAAAAE2NvbHJuY2x4AAEADQAGgAAAABdpcG1hAAAAAAAAAAEAAQQBAoMEAAAAHW1kYXQSAAoHGAAOWAhoNTIIH/AAAQACH0A'],
    ['jxl', 'data:image/jxl;base64,/wr/BwiDBAwASyAY'],
].map(([type, src]) => new Promise(resolve => {
    const img = new Image;
    img.onload = img.onerror = () => {
        if (img.width) imageSourceFormats.add(type);
        resolve();
    };
    img.src = src;
})));
imageSourceFormatsCheck.then(() => consoleBadge('Image support', Array.from(imageSourceFormats).join(', '), '#f6b'));

/**
 * @typedef {String} MediaQuery
 * @typedef {{
 *     srcset: String,
 *     sizes: undefined,
 * } | {
 *     srcset: [String, Number, 'x'][],
 *     sizes: undefined,
 * } | {
 *     srcset: [String, Number, 'w'][],
 *     sizes: [MediaQuery, Number, 'px' | 'vw' | 'vh'][],
 * }} SrcSet
 * @param {({
 *     src: String,
 *     alt?: String,
 *     title?: String,
 *     source?: ({
 *         type: String,
 *         media?: MediaQuery,
 *     } & SrcSet)[],
 * }) & SrcSet} image
 * @returns {Promise<String>}
 */
const imageSourceSelect = async image => {
    await imageSourceFormatsCheck;
    /**
     * @type {[
     *     string | [string, number, 'x' | 'w'][],
     *     [MediaQuery, number, 'px' | 'vw' | 'vh'][],
     * ][]}
     */
    const srcsetSizes = [
        ...(image.source || [])
            .filter(source => (
                imageSourceFormats.has(source.type) &&
                (!source.media || matchMedia(source.media).matches)
            ))
            .map(source => [source.srcset, source.sizes]),
        ...(image.srcset ? [image.srcset, image.sizes] : []),
    ];
    for (const [srcsetOriginal, sizesOriginal] of srcsetSizes) {
        /** @type {[String, Number, 'x' | 'w'][]} */
        const srcset = Array.isArray(srcsetOriginal) ? srcsetOriginal : [[srcsetOriginal, 1, 'x']];
        /** @type {'x' | 'w'} */
        let srcsetMode;
        ['x', 'w'].forEach(e => srcset.every(([_url, _value, mode]) => (mode === e) && (srcsetMode = e)));
        if (!srcsetMode) throw new Error('Invalid srcset');
        // 适用的像素密度/图片宽度升序
        srcset.sort(([_urlA, valueA, _modeA], [_urlB, valueB, _modeB]) => valueA - valueB);

        // console.log('srcset', srcset);
        // console.log('srcset mode', srcsetMode);

        switch (srcsetMode) {
            case 'x':
                // srcset 的 value 是适用的像素密度
                // 选择 ratio 最小的 value 大于等于当前 devicePixelRatio 的 url
                const srcsetFiltered = srcset.filter(([_url, ratio, _mode]) => ratio >= devicePixelRatio);
                return (srcsetFiltered.length ? srcsetFiltered[0] : srcset[srcset.length - 1])[0];
            case 'w':
                // 将 sizes 的断点换算为物理像素（devicePixelRatio）
                /** @type {[String, Number][]} */
                const sizes = sizesOriginal.map(([query, value, unit]) => {
                    /** @type {Number} */
                    let factor;
                    switch (unit) {
                        case 'px':
                            factor = 1;
                            break;
                        case 'vw':
                            factor = innerWidth / 100;
                            break;
                        case 'vh':
                            factor = innerHeight / 100;
                            break;
                        default:
                            throw new Error(`Invalid sizes unit "${unit}"`);
                    }
                    return [query, value * factor * devicePixelRatio];
                });
                // 添加 100vw 作为保底
                sizes.push(['all', innerWidth * devicePixelRatio]);
                // console.log('sizes', sizes);
                // srcset 的 value 是图片的宽度
                // 选择 width 最小的 value 大于 sizes 对应物理像素的 url
                for (const [query, value] of sizes) {
                    if (!matchMedia(query).matches) continue;
                    const srcsetFiltered = srcset.filter(([_url, width, _mode]) => width >= value);
                    return (srcsetFiltered.length ? srcsetFiltered[0] : srcset[srcset.length - 1])[0];
                }
        }
    }

    return image.src;
};

/**
 * @param {Function} fn
 * @param {Number} wait
 * @returns {Function}
 */
const debounce = (fn, wait) => {
    let timer = null;
    return function (...args) {
        const ctx = this;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn.apply(ctx, args), wait);
    };
};

class LazyLoad {
    static defaults = Object.freeze({
        root: null,
        rootMargin: '0px',
        threshold: 0,
        loadingSrc: null,
        beforeObserve: () => {},
        afterObserve: () => {},
    });

    /**
     * @param {HTMLElement[]} image
     * @param {{
     *  root: HTMLElement,
     *  rootMargin: String,
     *  threshold: Number | Number[],
     *  loadingSrc: String,
     *  beforeObserve: (e: HTMLElement) => void,
     *  afterObserve: (e: HTMLElement) => void,
     * }} config
     */
    constructor(image, config) {
        this.config = {...this.constructor.defaults, ...config};
        this.observer = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && this.load(entry.target)), this.config);

        image.forEach(async (/** @type {HTMLElement} */ el) => {
            if (this.config.loadingSrc) {
                await this.setSrc(el, this.config.loadingSrc);
            }
            this.config.beforeObserve(el);
            this.observer.observe(el);
        });

        this.loaded = [];
        addEventListener(
            'resize',
            debounce(
                () => this.loaded.forEach(
                    ([el, image]) => imageSourceSelect(image).then(src => this.setSrc(el, src))
                ),
                200,
            ),
        );
    }
    /**
     * @param {HTMLElement} el
     * @param {String} src
     * @returns {Promise<void>}
     */
    setSrc(el, src) {
        return new Promise(resolve => {
            const preloadImg = new Image;
            preloadImg.onload = preloadImg.onerror = () => {
                if (el.tagName.toLowerCase() === 'img') {
                    el.src = src;
                } else {
                    el.style.backgroundImage = `url(${src})`;
                }
                resolve();
            }
            preloadImg.src = src;
        });
    }
    /**
     * @param {HTMLElement} el
     */
    load(el) {
        const datasrc = el.getAttribute('data-src');
        let image;
        try {
            image = JSON.parse(datasrc);
        } catch (e) {
            image = { src: datasrc };
        }
        imageSourceSelect(image)
            .then(src => this.setSrc(el, src))
            .then(() => {
                this.observer.unobserve(el);
                this.config.afterObserve(el);
                this.loaded.push([el, image]);
            })
            .catch(err => console.log('Failed to load image', err, el));
    }
    destroy() {
        this.observer.disconnect();
        this.config = null;
    }
}

// ****************
// 返回顶部
// ****************
(() => {

const top = document.getElementById('akarin-top');
if (!top) return;

const body = document.body;
const documentElement = document.documentElement;

const scroll = () => {
    const bodyScrollTop = body.scrollTop;
    const documentScrollTop = documentElement.scrollTop;
    const topOffset = bodyScrollTop + documentScrollTop;
    const speed = topOffset / 4;
    if (bodyScrollTop != 0) {
        body.scrollTop -= speed;
    } else {
        documentElement.scrollTop -= speed;
    }
    if (topOffset) requestAnimationFrame(scroll);
};

top.onclick = () => requestAnimationFrame(scroll);

if (top.tagName.toLowerCase() === 'button') {
    const showFab = () => top.classList[
        (2 * documentElement.scrollTop < documentElement.clientHeight) ? 'add' : 'remove'
    ]('mdui-fab-hide');
    let timer;
    addEventListener('scroll', () => {
        clearInterval(timer);
        timer = setTimeout(showFab, 200);
    });
    showFab();
}

})();

// ****************
// 深色模式
// ****************
(() => {

const dark = Array.from(document.querySelectorAll('[data-dark]'));
dark.forEach((e, i) => {
    e.addEventListener('click', () => {
        dark.forEach((t, j) => t.classList[(i === j) ? 'add' : 'remove']('mdui-list-item-active'));
        switchDark(e.getAttribute('data-dark'));
    });
});
const currentMode = localStorage.getItem('dark');
const currentDark = dark.find(e => e.getAttribute('data-dark') === currentMode);
if (currentDark) currentDark.classList.add('mdui-list-item-active');

})();

// 点击主页的封面图也能打开文章，并且添加预加载
Array.from(document.querySelectorAll('[data-entry]')).forEach(e => {
    const el = e.parentElement.previousElementSibling;
    el.onclick = () => location.href = e.href;
    if (window.preload) el.addEventListener('mouseover', () => !_preloadedList.has(e.href) && setTimeout(() => preload(e.href), 8 * _delayOnHover));
});

// ****************
// 对文章进行处理
// ****************
(() => {

const copyBtn = document.createElement('button');
copyBtn.innerHTML = '<span class="mdui-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z"/></svg></span>';
copyBtn.classList.add(
    'mdui-btn',
    'mdui-btn-icon',
    'mdui-btn-dense',
    'mdui-ripple',
    'copy',
);
const copyCode = (/** @type {PointerEvent} */ e) => navigator.clipboard.writeText(e.currentTarget.previousSibling.innerText);

const beforeObserve = el => (el.tagName.toLowerCase() === 'img') && mediumZoom(el, {
    margin: 16,
    scrollOffset: 8,
    background: 'rgba(0,0,0,.85)',
});
const afterObserve = el => {
    const blurred = (el.nextElementSibling && el.nextElementSibling.classList.contains('akarin-blurred'))
        ? el.nextElementSibling
        : el.querySelector('.akarin-blurred');
    if (blurred) {
        setTimeout(() => blurred.classList.add('akarin-blurred-fade-out'), 50);
        setTimeout(() => blurred.style.visibility = 'hidden', 1050);
    }
};

new LazyLoad(Array.from(document.querySelectorAll('.akarin-util-bg-cover[data-src]')), {
    beforeObserve,
    afterObserve,
});

/**
 * @param {HTMLElement} container
 */
const enhance = container => {
    // 为图片添加懒加载
    new LazyLoad(Array.from(container.querySelectorAll('[data-src]')), {
        beforeObserve,
        afterObserve,
    });

    // 在视频上添加class
    Array.from(container.querySelectorAll('video,.video-container')).forEach(e => {
        e.classList.add(
            `mdui-video-${e.tagName.toLowerCase() === 'video' ? 'fluid' : 'container'}`,
            'mdui-img-rounded',
            'mdui-center',
            'mdui-hoverable'
        );
    });

    // “复制代码”按钮
    Array.from(article.querySelectorAll('pre.shiki')).forEach(e => {
        /** @type {HTMLButtonElement} */
        const copyBtnCloned = copyBtn.cloneNode(true);
        copyBtnCloned.onclick = copyCode;
        e.after(copyBtnCloned);
    });

    // 在img上添加一些class
    Array.from(container.children).filter(e => e.tagName === 'IMG').forEach(e => {
        e.classList.add(
            'mdui-img-fluid',
            'mdui-img-rounded',
            'mdui-center',
            'mdui-hoverable',
            'mdui-m-y-3'
        );
    });
};

const article = document.querySelector('article');
if (article) enhance(article);

const te = new TextEncoder;
const td = new TextDecoder;

/**
 * @param {PointerEvent} e
 */
const encryptHandler = async e => {
    const container = e.currentTarget.parentNode.parentNode;
    const passwordInput = container.querySelector('input[type=password]');
    const password = passwordInput.value.trim();
    if (!password) return;
    /** @type {Uint8Array} */
    const saltiv = (Uint8Array.frombase64 || (e => Uint8Array.from(atob(e), e => e.charCodeAt())))(container.getAttribute('data-saltiv'));
    const salt = saltiv.subarray(0, 16);
    const iv = saltiv.subarray(16, 16 + 12);
    /** @type {Uint8Array} */
    const encrypted = (Uint8Array.frombase64 || (e => Uint8Array.from(atob(e), e => e.charCodeAt())))(container.getAttribute('data-encrypted'));

    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            hash: 'SHA-256',
            salt,
            iterations: 600000,
        },
        await crypto.subtle.importKey('raw', te.encode(password), 'PBKDF2', false, ['deriveKey']),
        { name: 'AES-GCM', length: 128 },
        false,
        ['decrypt'],
    );
    try {
        const decrypted = td.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted));
        container.innerHTML = decrypted;
        enhance(container);
        Array.from(container.children).forEach(e => container.before(e));
        container.parentNode.removeChild(container);
    } catch {
        passwordInput.value = '';
        alert('密码错误');
    }
};

Array.from(document.querySelectorAll('[data-encrypted]')).forEach(el => {
    el.querySelector('button').onclick = encryptHandler;
    el.querySelector('input[type=password]').addEventListener('keypress', e => e.keyCode === 13 && encryptHandler(e));
});

})();

})(document)