!!window && (function(window, func) {
    if (typeof define === 'function' && define.amd) {
        define(function () {
        	return func;
        });
    } else if (typeof exports === 'object') {
        module.exports = function () {
        	return func;
        };
    } else {
        window.isDomElement = func;
    }
})(window, (function(win, doc) {
	var HTMLElmentObj=win.HTMLElement;
	if(typeof HTMLElmentObj==="object"){
		return function (obj) {
			return !!obj && (obj instanceof HTMLElmentObj);
		};
	}else{
		return function (obj) {
			return !!obj && (typeof obj==="object") && obj.nodeType===1 && (typeof obj.nodeName==="string");
		};
	}
})(window,document));