(function(root, func) {
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return func();
		});
	} else if (typeof exports === 'object') {
		module.exports = func;
	} else {
		root.objectPool = func();
	}
})(this, function() {
	var pool,
		maxCount,
		usingCount,
		freeCount,
		usingIndex,
		freeIndex,
		objRef;

	function init() {
		!!window && procWinBeforeUnload(window);
		pool = [];
		!maxCount && (maxCount = 50);
		usingCount = freeCount = 0;
		usingIndex = [];
		freeIndex = [];
	}

	function procWinBeforeUnload(win) {
		var wbu,
			onbu;
		wbu = win.onbeforeunload;
		win.onbeforeunload = (!!wbu) ? (function() {
			wbu();
			win=win.onbeforeunload = onbu = wbu =null;
			doGC();
		}) : (function() {
			win=win.onbeforeunload = onbu = wbu =null;
			doGC();
		});
	}

	function doGC() {
		delete objRef.getNew;
		delete objRef.setPageCapacity;
		delete objRef.getPool;
		delete objRef.collectGabage;
		objRef = pool = maxCount = usingCount = freeCount = usingIndex = freeIndex = null;
	}

	return objRef = {
		getNew: function() {
			init();
			objRef.new = function() {
				var res,
					index,
					obj;
				if (freeCount > 0) {
					index = freeIndex.shift();
					freeCount--;
					usingIndex.push(index);
					usingCount++;
					obj = pool[index];
				} else if (maxCount === freeCount + usingCount) {
					console.error("对象池达到最大容量。");
					return null;
				} else {
					pool[index = pool.length] = obj = {};
					usingIndex.push(index);
					usingCount++;
				}

				res = {
					get: function(key) {
						return obj[key] || null;
					},
					set: function(key, val) {
						!!key && (obj[key] = val);
						return res;
					},
					collect: function() {
						res = null;
						for (var key in obj) {
							delete obj[key];
						}
						freeIndex.push(index);
						freeCount++;
						usingIndex.splice(usingIndex.indexOf(index), 1);
						usingCount--;
						return objRef;
					}
				};

				return res;
			};
			return this.new();
		},
		setCapacity: function(cap) {
			if (typeof cap === "number" && cap > 0) {
				maxCount = ~~cap;
			}
			return objRef;
		},
//		getPool: function() {
//			return pool;
//		},
		collectGabage: doGC
	};
});