(function($, w, d, de, db) {

    de = d.documentElement;
    db = d.body;

    /* UTILS */
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

    function lcFirst(str) {
        return str.slice(0, 1).toLowerCase() + str.slice(1);
    }

    function lpad(num, len) {
        var str = '' + num;
        while (str.length < len) str = '0' + str;
        return str;
    }

    function formatNumber(num, opt) {
        num = +(Math.round(parseFloat(num) + 'e+' + opt.decimals) + 'e-' + opt.decimals)
        opt.rpad && (num = num.toFixed(opt.decimals));

        var parts = num.toString().split('.'),
            integer = parts[0],
            decimals = parts[1] ? opt.dsep + parts[1] : '';

        opt.lpad && (integer = lpad(integer, opt.counter.toString().length));
        return opt.prefix + integer.replace(/(\d)(?=(?:\d{3})+$)/g, '$&' + opt.tsep) + decimals + opt.suffix;
    }

    function filterDataset(data, prefix, unprefix) {
        var obj = {};
        $.each(data, function(key, val) {
            if (key.indexOf(prefix) !== 0) return;
            if (unprefix) key = lcFirst(key.replace(prefix, ''));
            key && (obj[key] = val);
        });
        return obj;
    }

    /* ANIMATIONS */
    var animations = [
        {
            selector: '.animate:not(.animated)',
            animate: function(elm) {
                elm = $(elm);
                elm.css(filterDataset(elm.data(), 'animation')).addClass('animated');
            }
        },
        {
            selector: '[data-typewriter]:not(.typing)',
            animate: function(elm, opt) {
                elm = $(elm);
                opt = $.extend({
                    random: true,
                    speed: 150,
                    pause: 2e3
                }, opt || filterDataset(elm.data(), 'typewriter', true));
        
                var words = elm.data().typewriter.split(','),
                    backspace = false,
                    index = 0,
                    str = '';
        
                function typewriter() {
                    var delta = opt.speed - (opt.random ? Math.random() * 100 : 0),
                        word = words[index % words.length].trim();
        
                    str = word.slice(0, str.length + (backspace ? -1 : 1));
                    backspace && (delta /= 2);
                    elm.text(str);
        
                    if (!backspace && str === word) {
                        delta = opt.pause;
                        backspace = true;
                    } else if (backspace && str === '') {
                        backspace = false;
                        index++;
                        delta = opt.speed;
                    }
        
                    setTimeout(typewriter, delta);
                }
        
                elm.addClass('typing');
                typewriter();
            },
        },
        {
            selector: '[data-count-to]:not(.counting)',
            animate: function(elm, opt) {
                elm = $(elm);
                opt = $.extend({
                    to: 0,
                    from: 0,
                    speed: 2000,
                    prefix: '',
                    suffix: '',
                    decimals: 0,
                    lpad: false,
                    rpad: false,
                    tsep: '.',
                    dsep: ','
                }, opt || filterDataset(elm.data(), 'count', true));
        
                elm.addClass('counting');
        
                $({
                    count: parseFloat(opt.from)
                }).animate({
                    count: parseFloat(opt.to)
                }, {
                    duration: opt.speed,
                    easing: 'linear',
                    step: function() {
                        elm.text(formatNumber(this.count, opt));
                    },
                    complete: function() {
                        elm.text(formatNumber(this.count, opt));
                    }
                });
            },
        }
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
                opt = $.extend({offset: 0}, opt);

                var r = elm.getBoundingClientRect(),
                    width = $(w).width(),
                    height = $(w).height();

                return (r.bottom + opt.offset > 0 && r.left - opt.offset < width && r.top - opt.offset < height && r.right + opt.offset > 0) | 0;
            }

            function callback() {
                cb(entries.map(function(e) {
                    return $.extend(e, {intersectionRatio: getRatio(e.target)});
                }));
            }

            $(w).on('DOMContentLoaded load scroll touchmove resize', throttle(callback, 3e2));

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
            animations.forEach(function(animation) {
                $(elm).is(animation.selector) && animation.animate(elm);
            });
        });
    }

    function setIntersections() {
        animations.forEach(function(animation) {
            $(animation.selector).each(function(idx, elm) {
                intersectionObserver.observe(elm);
            });
        });
        intersectionObserver.callback && intersectionObserver.callback();
    }

    if (!('MutationObserver' in w)) {
        // TODO: polyfill
        w.MutationObserver = function(cb) {
            return {
                observe: function() {},
                unobserve: function() {}
            };
        };
    }

    function getMutations(mutations) {
        mutations.forEach(function(mutation) {
            var nodes = [].slice.call(mutation.addedNodes);
             nodes.forEach(function(node) {
                node.nodeType === Node.ELEMENT_NODE && setIntersections();
            });
        });
    }

    /*  INIT */
    var intersectionObserver = new IntersectionObserver(getIntersections);
    var mutationObserver = new MutationObserver(getMutations);
    mutationObserver.observe(db, {childList: true, subtree: true});
    setIntersections();
    w.animations = animations;

}(jQuery, window, document));