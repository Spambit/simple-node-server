(function () {

    /** console.log interceptor */
    let originalConsoleLog = window.console.log;
    window.console.log = function (message) {
        originalConsoleLog(message);
        var command = {};
        command.namespace = 'HSIPlatformService';
        command.action = 'ConsoleLog';
        command.payload = {
            'log': message
        };
        window.webkit.messageHandlers.hsibridge.postMessage(encodeURIComponent(JSON.stringify(command)));
    };

    const http = 'http',
        https = 'https',
        protocolToSet = 'hsi-local',
        originalSchemeQueryParamText = 'originalScheme';
    if (window.location.protocol !== `${http}:` && window.location.protocol !== `${https}:`) {
        return;
    }

    Object.defineProperty(window, "hsiwkHostingScheme", {
        value: window.location.protocol === `${http}:` ? http : https,
        writable: false,
        enumerable: true
    });

    function doesContainKnowProtocol(url) {
        return url.startsWith(https) || url.startsWith(http);
    }

    function isImgElement(node) {
        return node && node.nodeType === 1 && node.tagName.toLowerCase() === 'img'
    }

    function isScriptElement(node) {
        return node && node.nodeType === 1 && node.tagName.toLowerCase() === 'script'
    }

    function mutateNodeSrcToHSIWKWebViewType(node) {
        if (node.src) {
            node.src = urlMutator(node.src)
        }
    }

    function urlMutator(url) {
        if (!url || !doesContainKnowProtocol(url)) {
            return url
        }
        var originalScheme;
        if (url.startsWith(https)) {
            url = `${url.replace(https, protocolToSet)}`;
            originalScheme = https;
        } else if (url.startsWith(http)) {
            url = `${url.replace(http, protocolToSet)}`;
            originalScheme = http;
        }
        let urlObj = new URL(url);
        let params = urlObj.searchParams;
        params.append(originalSchemeQueryParamText,originalScheme);
        return urlObj.href
    }

    /** Observes any inline scripts and img tag appended in DOM */
    const observer = new MutationObserver(mutations => {
        mutations.forEach(({ addedNodes }) => {
            addedNodes.forEach(node => {
                if (isScriptElement(node) || isImgElement(node)) {
                    mutateNodeSrcToHSIWKWebViewType(node);
                }
            });
        });
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    const originalCreateElement = document.createElement;

    /** Intercepted dynamically created script, img tag */
    function customCreateElement(tagName, options) {
        const el = originalCreateElement.call(document, tagName, options);
        if (tagName.toLowerCase() !== 'script' && tagName.toLowerCase() !== 'img') {
            return el;
        }
        const originalSetAttribute = el.setAttribute.bind(el);
        Object.defineProperties(el, {
            'src': {
                get() {
                    return el.getAttribute('src');
                },
                set(value) {
                    const mutated = urlMutator(value);
                    originalSetAttribute('src', mutated || value);
                    return true;
                }
            }
        });
        return el;
    }
    document.createElement = customCreateElement;

    /** Intercepted dynamically created img tag through Image constructor */
    let NativeImage = window.Image
    class CustomImage {
        constructor(width, height) {
            const nativeImage = new NativeImage(width, height);
            const handler = {
                set: function (target, prop, value) {
                    if (prop === 'src') {
                        value = urlMutator(value) || value;
                    }
                    return (nativeImage)[prop] = value;
                },
                get: function (target, prop) {
                    let result = target[prop];
                    if (typeof result === 'function') {
                        result = result.bind(target);
                    }
                    return result;
                }
            };
            const proxy = new Proxy(nativeImage, handler);
            try {
                proxy[Symbol.toStringTag] = 'HTMLImageElement';
            } catch (e) {
                console.log('HSIWKUserScript error : #{e}')
            }
            CustomImage.prototype[Symbol.toStringTag] = NativeImage.prototype.toString();
            return proxy;
        }
    }

    Object.defineProperty(CustomImage, 'name', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: 'Image'
    });

    Object.defineProperty(CustomImage, 'toString', {
        enumerable: true,
        configurable: false,
        writable: true,
        value: function () {
            return NativeImage.toString();
        }
    });

    window.Image = CustomImage;

    /** Intercepted native xhr */
    if (XMLHttpRequest) {
        const originalOpen = XMLHttpRequest.prototype.open;
        function customOpen(method, url, async, username,
            password) {
            const mutated = urlMutator(url);
            if (mutated) {
                url = mutated;
            }
            if (typeof async === 'undefined') {
                return originalOpen.call(this, method, url, true);
            } else {
                return originalOpen.call(this, method, url, async, username, password);
            }
        }

        XMLHttpRequest.prototype.open = customOpen;
    }

    /** Intercepted native xhr */
    if (window.fetch) {
        const fetch = window.fetch;
        window.fetch = function (request, config) {
            if (typeof request === 'string') {
                const mutated = urlMutator(request);
                if (mutated) {
                    request = mutated;
                }
                return fetch(request, config);
            } else {
                const mutated = urlMutator(request && request.url);
                if (mutated) {
                    request.url = mutated;
                }
                return fetch(request, config);
            }
        };
    }
})()