(function (window , document, NativeImage, ProxyClass,
    XMLHttpRequestClass) {
const fileProtocol = 'file:';
//if (window.location.protocol !== fileProtocol) {
// return;
//}
const protocolToUse = 'http:';
const fileRoot = '/';
const relativeProtocol = '//';
const fileProtocolFull = fileProtocol + relativeProtocol;
const fileRootFull = fileProtocolFull + fileRoot;
const relativeRootFull = relativeProtocol + fileRoot;

const observer = new MutationObserver(mutations => {
    mutations.forEach(({ addedNodes }) => {
        addedNodes.forEach(node => {
            // For each added script tag
            if(node.nodeType === 1 && node.tagName === 'SCRIPT') {
                const src = node.src || ''
                const type = node.type
                // If the src is inside your blacklist
                if(needsToBeBlacklisted(src, type)) {
                   // Do some stuff that will prevent the script tag loading ;)
                   // (See below…)
                }
            }
        })
    })
})

// Starts the monitoring
observer.observe(document.documentElement, {
    childList: true,
    subtree: true
})

function urlMutator(url) {
 let ret;
 if (url && url.indexOf(fileProtocolFull) === 0 && url.indexOf(fileRootFull) < 0) {
     ret = url.replace(fileProtocol, protocolToUse);
     console.log('mutating url', url, 'to', ret);
     return ret;
 }
 if (url && url.indexOf(relativeProtocol) === 0 && url.indexOf(relativeRootFull) < 0) {
     ret = protocolToUse + url;
     console.log('mutating url', url, 'to', ret);
     return ret;
 }
}

const createElementBackup = document.createElement;

//function myCreateElement(tagName, options)
function myCreateElement(tagName, options) {
 const scriptElt = createElementBackup.call(document, tagName, options);
 if (tagName.toLowerCase() !== 'script') {
     return scriptElt;
 }
 const originalSetAttribute = scriptElt.setAttribute.bind(scriptElt);
 Object.defineProperties(scriptElt, {
     'src': {
         get() {
             return scriptElt.getAttribute('src');
         },
         set(value) {
             const mutated = urlMutator(value);
             originalSetAttribute('src', mutated || value);
             return true;
         }
     }
 });
 return scriptElt;
}

document.createElement = myCreateElement;

class FakeImage {
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
     const proxy = new ProxyClass(nativeImage, handler);
     try {
         proxy[Symbol.toStringTag] = 'HTMLImageElement';
     } catch (e) {
     }
     FakeImage.prototype[Symbol.toStringTag] = NativeImage.prototype.toString();
     return proxy;
 }
}

Object.defineProperty(FakeImage, 'name', {
 enumerable: false,
 configurable: false,
 writable: false,
 value: 'Image'
});

Object.defineProperty(FakeImage, 'toString', {
 enumerable: true,
 configurable: false,
 writable: true,
 value: function () {
     return NativeImage.toString();
 }
});

window.Image = FakeImage;
if (XMLHttpRequestClass) {
 const open = XMLHttpRequestClass.prototype.open;

 //function myOpen(method, url);
 //function myOpen(method, url, async, username,
 //                password);
 function myOpen( method, url, async, username,
                 password) {
     const mutated = urlMutator(url);
     if (mutated) {
         url = mutated;
     }
     if (typeof async === 'undefined') {
         return open.call(this, method, url, true);
     } else {
         return open.call(this, method, url, async, username, password);

     }
 }

 XMLHttpRequestClass.prototype.open = myOpen;
}
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
})(window, document, Image, Proxy, XMLHttpRequest);