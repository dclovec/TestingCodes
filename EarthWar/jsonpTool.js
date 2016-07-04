!!window && (function(window, func) {
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return func();
        });
    } else if (typeof exports === 'object') {
        module.exports = func;
    } else {
        window.jsonpTool = func();
    }
})(window, function() {
    var script = document.createElement("script"),
        body = document.body,
        fetchingUrls = [],
        si,
        isFetching;

    window.onbeforeunload=function () {
    	script=body=fetchingUrls=si=isFetching=null;
    };
    
    script.onload = function() {
        body.removeChild(script);
        isFetching = false;
    };
    script.onerror = function() {
        body.removeChild(script);
        isFetching = false;
    };
    script.async = true;

    return function(url) {
        var node,
            index;
            console.log(fetchingUrls);
        if (fetchingUrls.indexOf(url)===-1) {
            index=fetchingUrls.length;
            fetchingUrls.push(url);
            
            if (!isFetching) {
                si=index;
                isFetching = true;
                script.src = url;
                body.appendChild(script);
                return;
            }
            
            node = script.cloneNode();
            node.src = url;
            node.onload = function() {
                body.removeChild(node);
                node = null;
            };
            node.onerror = function() {
                body.removeChild(node);
                node = null;
            };
            body.appendChild(node);
            return;
        }
        console.error("The script \""+url+"\" has been executed.");
    };
});