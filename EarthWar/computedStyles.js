!!window && (function(window, func) {
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return func;
        });
    } else if (typeof exports === 'object') {
        module.exports = function() {
            return func;
        };
    } else {
        window.computedStyles = func;
        func = null;
    }
})(window, (function() {
    var func,
        getValueFunc;

    function setGV(obj) {
        var arr,
            tmp,
            index,
            len;

        if (!!obj.getPropertyValue) {
            getValueFunc = function(styles, cssName) {
                return styles.getPropertyValue(cssName);
            };
        } else if (!!obj.getAttribute) {
            getValueFunc = function(styles, cssName) {
                if (cssName.indexOf("-") !== -1) {
                    (cssName.indexOf("-") === 0) && (cssName = cssName.slice(1));
                    arr = cssName.split("-");
                    if ((len = arr.length) > 1) {
                        cssName = arr[0];
                        for (index = 1; index < len; index++) {
                            tmp = arr[index];
                            cssName += tmp.slice(0, 1).toUpperCase() + tmp.slice(1);
                        }
                    } else {
                        console.error("css name is invalid.(function computedStyles)");
                        return null;
                    }
                }
                return styles.getAttribute(cssName);
            };
        }
    }

    if (!!window.getComputedStyle) {
        setGV(window.getComputedStyle(document.body, null));
        func = (function(window) {
            return function(element, simulateElement) {
                var styles = window.getComputedStyle(element, simulateElement || null);
                return {
                    get: function(cssName) {
                        return getValueFunc(styles, cssName);
                    }
                };
            };
        })(window);
    } else if (!!document.defaultView && !!document.defaultView.getComputedStyle) {
        setGV(document.defaultView.getComputedStyle(document.body, null));
        func = (function(document) {
            return function(element, simulateElement) {
                var styles = document.defaultView.getComputedStyle(element, simulateElement || null);
                return {
                    get: function(cssName) {
                        return getValueFunc(styles, cssName);
                    }
                };
            }
        })(document);
    } else if (!!document.body.currentStyle) {
        setGV(document.body.currentStyle);
        func = function(element) {
            var styles = element.currentStyle;
            return {
                get: function(cssName) {
                    return getValueFunc(styles, cssName);
                }
            };
        };
    } else {
        console.error({
            message: "Not supported broswer, cannot specify!",
            type: "NotSupportException"
        });
        func = function() {
            return function() {
                return null;
            };
        };
    }
    return func;
})(window, document));