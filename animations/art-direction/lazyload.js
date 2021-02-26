(function(w, d, de, db) {

    de = d.documentElement;
    db = d.body;

    /* UTILS */
    function s(sel, ctx) {
        ctx = ctx || d;
        return ctx.querySelector(sel);
    }

    function ss(sel, ctx) {
        ctx = ctx || d;
        var elms = ctx.querySelectorAll(sel);
        return [].slice.call(elms);
    }

    function is(elm, sel) {
        var matches = elm.matches || elm.matchesSelector || elm.webkitMatchesSelector || elm.mozMatchesSelector || elm.msMatchesSelector || elm.oMatchesSelector;
        return matches && matches.call(elm, sel);
    }

    function on(elm, evt, cb) {
        evt.split(' ').forEach(function(e) { elm.addEventListener(e, cb, false); });
    }

    function off(elm, evt, cb) {
        evt.split(' ').forEach(function(e) { elm.removeEventListener(e, cb); });
    }

    function extend(dest, src) {
        src = [].slice.call(arguments, 1);
        for (var i = 0, l = src.length; i < l; i++) {
            if (!src[i]) continue;
            for (var prop in src[i]) Object.prototype.hasOwnProperty.call(src[i], prop) && (dest[prop] = src[i][prop]);
        }
        return dest;
    }

    function throttle(cb, delay, debounce) {
        delay = delay || 0;

        var last = 0,
            timeout;

        function throttled() {
            var now = +new Date(),
                diff = debounce ? 0 : now - last,
                args = arguments,
                that = this;

            if (diff >= delay) {
                last = now;
                return cb.apply(that, args);
            } else {
                timeout && clearTimeout(timeout);
            }
            timeout = setTimeout(function() {
                timeout = null;
                return cb.apply(that, args);
            }, delay - diff);
        }

        return throttled;
    }

    /* TRANSFORMATIONS */
    var transformations = [
        {
            selector: '[data-lazyload]',
            transform: function(elm) {
                var sources = ss('[data-srcset]', elm),
                    image = s('img', elm);

                function setSrc(elm, src) {
                    elm.setAttribute('src', src || elm.getAttribute('data-src'));
                    elm.removeAttribute('data-src');
                }

                function setSrcSet() {
                    sources.forEach(function(elm) {
                        elm.setAttribute('srcset', elm.getAttribute('data-srcset'));
                        elm.removeAttribute('data-srcset');
                    });
                }

                function setPixelRatio(elm) {
                    var srcset = elm.getAttribute('data-srcset').replace(/,\s+/g, ',').split(','),
                        src;

                    srcset.forEach(function(str) {
                        str = str.match(/^(.*)\s(\d+)/);
                        parseFloat(str[2]) <= w.devicePixelRatio && (src = str[1]);
                    });

                    setSrc(image, src);
                }

                function matchMedia() {
                    var match;
                    sources.forEach(function(elm) {
                        var media = elm.getAttribute('media');
                        !match && media && w.matchMedia(media).matches && (match = elm);
                    });
                    setPixelRatio(match || s('[data-srcset]:not([media])', elm));
                }

                if (sources.length) {
                    if (support.srcset) {
                        setSrcSet();
                    } else if (support.matchMedia) {
                        if (sources.length > 1) {
                            on(w, 'resize', throttle(matchMedia, 3e2));
                            matchMedia();
                        } else {
                            setPixelRatio(sources[0]);
                        }
                    } else {
                        setPixelRatio(sources[0]);
                    }
                } else {
                    setSrc(image);
                }
            }
        },
    ];

    /* OBSERVERS */
    if (!('IntersectionObserver' in w)) {
        w.IntersectionObserver = function(cb) {
            var entries = [];

            function observe(elm) {
                !entries.some(function(e) { return e.target === elm; }) && entries.push({target: elm});
            }

            function unobserve(elm) {
                entries = entries.filter(function(e) { return e.target !== elm; });
            }

            function getRatio(elm, opt) {
                opt = extend({offset: 0}, opt);

                var r = elm.getBoundingClientRect(),
                    width = w.innerWidth,
                    height = w.innerHeight;

                return (r.bottom + opt.offset > 0 && r.left - opt.offset < width && r.top - opt.offset < height && r.right + opt.offset > 0) | 0;
            }

            function callback() {
                cb(entries.map(function(e) {
                    return extend(e, {intersectionRatio: getRatio(e.target)});
                }));
            }

            on(w, 'DOMContentLoaded load scroll touchmove resize', throttle(callback, 3e2));

            return {
                observe: observe,
                unobserve: unobserve,
                callback: callback
            };
        };
    }

    function isIntersecting(elm) {
        return elm.isIntersecting || elm.intersectionRatio > 0;
    }

    function getIntersections(elms) {
        elms.forEach(function(elm) {
            if (!isIntersecting(elm)) return;
            elm = elm.target;
            intersectionObserver.unobserve(elm);
            transformations.forEach(function(transformation) {
                is(elm, transformation.selector) && transformation.transform(elm);
            });
        });
    }

    function setIntersections() {
        transformations.forEach(function(transformation) {
            ss(transformation.selector).forEach(function(elm) {
                intersectionObserver.observe(elm);
            });
        });
        intersectionObserver.callback && intersectionObserver.callback();
    }

    function getMutations(mutations) {
        mutations.forEach(function(mutation) {
            var nodes = [].slice.call(mutation.addedNodes);
            nodes.forEach(function(node) {
                node.nodeType === Node.ELEMENT_NODE && setIntersections();
            });
        });
    }

    /* SUPPORT */
    function checkSupport() {
        d.createElement('picture');
        var img = new Image();
        return {
            srcset: 'srcset' in img,
            matchMedia: !!w.matchMedia,
        };
    }

    /*  INIT */
    var support = checkSupport();
    // console.log(support);
    var intersectionObserver = new IntersectionObserver(getIntersections);
    if ('MutationObserver' in w) {
        var mutationObserver = new MutationObserver(getMutations);
        mutationObserver.observe(db, {childList: true, subtree: true});
    }
    setIntersections();
    w.lazyload = setIntersections;
    // NOTE: call window.lazyload() if no MutationObserver support

}(window, document));