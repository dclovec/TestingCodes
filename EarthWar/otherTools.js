var Tools = (function() {
	var obj = {
		/*更好的随机函数（ECMA 3+）*/
		random: (function() {
			var seed;

			return function() {
				if (!seed) {
					seed = (new Date()).getTime();
					this.random = function() {
						seed = (seed * 9301 + 49297) % 233280;
						return seed / (233280.0);
					};
					return this.random();
				}
			};
		})(),
		/*转换参数对象arguments为数组*/
		argumentsToArray: function(args) {
			var len = args.length,
				data = [];
			for (var i = 0; i < len; i++) {
				data[i] = args[i];
			}
			return data;
		},
		/*随机序列数组*/
		randomArrange: function(min, max) {
			var result;
			max = ~~(+max);
			min = ~~(+min);
			if (max > min) {
				var index = 1 + max - min;
				result = new Array(index);
				var data = new Array(index);
				for (var i = min, index = 0; i < max; i++, index++) {
					data[index] = i;
				}
				data[index] = max;
				i = 0;
				while (data.length > 0) {
					index = ~~(this.random() * (data.length));
					result[i++] = data.splice(index, 1)[0];
				}
			}
			return result || [];
		},
		/*获取url中的参数*/
		parseUrlParams: (function() {
			var data;

			function getByKey(key) {
				if (key) {
					return data[key];
				} else {
					var res = {};
					for (var key in data) {
						if (data.hasOwnProperty(key)) {
							res[key] = data[key];
						}
					}
					return res;
				}
			}

			function parse() {
				data = {};
				var params = location.search.slice(1),
					start = 0;
				if (0 < params.length && params.indexOf("=") !== -1) {
					params = params.split("&");
					var item;
					for (var i = 0, len = params.length; i < len; i++) {
						item = params[i].split("=");
						item.length > 1 ? (data[item[0]] = item[1]) : undefined;
					}
				}
				return getByKey;
			}

			return parse;
		})(),
		/*异步加载JS文件,自动执行，执行环境为window根域。回调函数带一个参数state，成功1或失败0*/
		loadJsFromFileAsync: function(fileUrl, succ_Call, err_Call) {
			var script = document.createElement("script");
			script.async = true;
			script.onload = function() {
				document.body.removeChild(script);
				succ_Call && window.setTimeout(succ_Call, 17);
				script = succ_Call = err_Call = null;
			};
			script.onerror = function() {
				document.body.removeChild(script);
				err_Call && window.setTimeout(err_Call, 17);
				script = succ_Call = err_Call = null;
				console.log("error load js file ( url is:" + this.src + " )");
			};
			script.src = fileUrl;
			document.body.appendChild(script);
		},
		/*创建列表结构管理器*/
		createListManager: function(containerElement, listOptionConfig) {
			function getObjContext(containerEL, optionType) {
				var container = containerEL,
					aviableOptions = [],
					inUseOptions = [],
					modeNode = document.createElement(optionType),
					inUseOptionsCount = 0;

				containerEL = optionType = null;

				function getOneOption() {
					var node;
					if (aviableOptions.length) {
						node = aviableOptions.shift();
					} else {
						node = modeNode.cloneNode(true);
						container.appendChild(node);
					}

					inUseOptions.push(node);
					inUseOptionsCount++;

					return node;
				}

				function queueCall(aNode, theCall, i) {
					window.setTimeout((function(node, func, index) {
						func.call(node, node, index);
					})(aNode, theCall, i), 0);
				}

				return {
					getOne: function(callback) {
						if (callback) {
							var index = inUseOptionsCount,
								node = getOneOption();

							queueCall(node, callback, index);

							callback = node = index = null;
						}
						return this;
					},
					getAll: function(callback) {
						if (callback) {
							var all = [inUseOptions, aviableOptions],
								allIndex = 0,
								item,
								index,
								len;

							for (var i = 0, count = 2; i < count; i++) {
								item = all[i];
								for (index = 0, len = item.length; index < len; index++) {
									queueCall(item[i], callback, allIndex++);
								}
							}
							all = callback = item = i = count = index = len = null;
						}
						return this;
					},
					resetAll: function(callback) {
						var len = inUseOptions.length,
							node;
						if (len) {
							len += aviableOptions.length;
							aviableOptions = inUseOptions.concat(aviableOptions);
							inUseOptions = [];
						} else {
							len = aviableOptions.length;
						}
						inUseOptionsCount = 0;

						if (callback) {
							for (var index = 0; index < len; index++) {
								node = aviableOptions[index];
								queueCall(node, callback, index);
							}
						}

						node = len = callback = index = null;
						return this;
					}
				};
			}

			return getObjContext(containerElement, listOptionConfig);
		},
		/*html5 web worker多线程异步执行*/
		doWorkByHtml5Worker: (function() {
			//获取所需对象
			var urlContext = window.URL || window.webkitURL || window.mozURL || window.msURL,
				blobBuilderContext = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder,
				blobBuilder;

			if (blobBuilderContext) {
				var clearBlob = function() {
					blobBuilder = null;
					blobBuilder = new blobBuilderContext();
					blobBuilder.clear = clearBlob;
				};
				clearBlob();
			} else if (Blob) {
				blobBuilder = {
					builder: null,
					append: function(str) {
						this.builder = new Blob([str]);
					},
					getBlob: function() {
						return this.builder;
					},
					clear: function() {
						this.builder = null;
					}
				}
			} else {
				throw new Error("your broswer don't support Blob Object.");
			}
			if (!urlContext) {
				throw new Error("your broswer don't support window.URL Object or compatible Object.");
			} else if (!Worker) {
				throw new Error("your broswer don't support Worker Object.");
			}

			return function(workFunc, params, callback) {
				var workStr = workFunc.toString();
				(workFunc !== workStr) && (workFunc = workStr);
				blobBuilder.append("var data=(" + workFunc + ")(" + JSON.stringify(params) + ");postMessage(data);");
				var worker = new Worker(urlContext.createObjectURL(blobBuilder.getBlob()));
				worker.onmessage = function(e) {
					this.terminate();
					worker = null;
					blobBuilder.clear();
					callback && callback(e.data);
				};
			};
		})(),
		/*后进先出的栈*/
		Stack: null,
		/*先进先出的队列*/
		Queue: null,
		/*判断对象中是否有指定的原型属性（ECMA 5）*/
		hasPrototypeProperty: function(obj, prop) {
			return (prop in obj) && (!obj.hasOwnProperty(prop));
		}
	};

	/*初始化*/
	(function() {
		/*栈和队列的父类-数据结构*/
		function Super(dataArray, initData) {
			this.length = 0;

			this.get = function() {
				if (dataArray.length) {
					var data = dataArray.shift();
					this.length = dataArray.length;
					return data;
				} else {
					return undefined;
				}
			};
			this.getAll = function() {
				var data = [],
					index = 0,
					len = this.length;
				while ((index++) < len) {
					data.push(dataArray.shift());
				}
				this.length = dataArray.length;
				return data;
			};

			if (initData && initData.length) {
				this.add.apply(this, initData);
			}
		}
		/*后进先出的栈*/
		obj.Stack = function() {
			var _arr = [];

			this.add = function() {
				var args = obj.argumentsToArray(arguments);
				if (args.length) {
					Array.prototype.unshift.apply(_arr, args);
				} else {
					_arr.unshift(null);
				}
				this.length = _arr.length;
				return this;
			};

			var _data = obj.argumentsToArray(arguments);
			Super.call(this, _arr, _data);
			_data = null;
		};
		/*先进先出的队列*/
		obj.Queue = function() {
			var _arr = [];

			this.add = function() {
				var args = obj.argumentsToArray(arguments);
				if (args.length) {
					Array.prototype.push.apply(_arr, args);
				} else {
					_arr.push(null);
				}
				this.length = _arr.length;
				return this;
			};

			var _data = obj.argumentsToArray(arguments);
			Super.call(this, _arr, _data);
			_data = null;
		};
	})();

	return obj;
})();

/*遍历数组（ECMA 3+）*/
!Array.prototype.forEach && (Array.prototype.forEach = function(func) {
	var me = this;
	if (typeof func === "function") {
		for (var i = 0, len = me.length; i < len; i++) {
			window.setTimeout((function(func, arr, i) {
				return function() {
					func.call(arr, arr[i], i);
				};
			})(func, me, i), 0);
		}
	}
});

/*面向对象中的寄生组合式继承：继承父类（引用类型最理想的继承方式）（ECMA 5+）*/
!Function.prototype.inheritPrototype && (Function.prototype.inheritPrototype = function(superType) {
	var me = this,
		obj = Object.create(superType.prototype);
	obj.constructor = me;
	me.prototype = obj;
});

/*包含函数*/
!String.prototype.contains && (String.prototype.contains = function(str) {
		return this.indexOf(str) !== -1;
});
!Array.prototype.contains && (Array.prototype.contains = function(item) {
		return this.indexOf(item) !== -1;
});

/*字符串型数字转换为数字类型*/
!String.prototype.toNumber && (String.prototype.toNumber = function() {
		return +this;
});