(function(root, func) {
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return func(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = function() {
			return func(root);
		};
	} else {
		window.queueTask = func(root);
	}
})(this, function(root) {
	var taskNames = [],
		taskFuncs = [],
		taskCount = 0,
		funcQueue = [],
		paramQueue = [],
		queueCount = 0,
		currentIndex = -1,
		isInBrowser = !!window,
		addNew,
		doTask,
		doGC,
		obj,
		isDisposed;

	function an(taskName, taskFunc, isReplace) {
		if (!!isDisposed) {
			return;
		}
		var index = taskNames.indexOf(taskName);
		if (-1 === index) {
			taskNames[taskCount] = taskName;
			taskFuncs[taskCount] = taskFunc;
			taskCount++;
			return;
		}
		!!isReplace && (taskFuncs[index] = taskFunc);
	}

	addNew = isInBrowser ? function(taskName, taskFunc, isReplace) {
		if (!!isDisposed) {
			return;
		}
		root.setTimeout(function() {
			an(taskName, taskFunc, isReplace);
		}, 17);
	} : function(taskName, taskFunc, isReplace) {
		if (!!isDisposed) {
			return;
		}
		root.setTimeout(function() {
			an(taskName, taskFunc, isReplace);
		}, 0);
	};

	function dt() {
		if (!!isDisposed) {
			return;
		}
		var index = ++currentIndex;
		if (index < queueCount) {
			taskFuncs[taskNames.indexOf(funcQueue[index])].call(obj, paramQueue[index]);
			funcQueue[index] = paramQueue[index] = null;
			0 < queueCount && doTask();
		} else {
			currentIndex = -1;
			queueCount = 0;
		}
	}

	doTask = isInBrowser ? function() {
		if (!!isDisposed) {
			return;
		}
		root.setTimeout(dt, 17);
	} : function() {
		if (!!isDisposed) {
			return;
		}
		root.setTimeout(dt, 0);
	};

	doGC = function() {
		isDisposed = true;
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				delete obj[key];
			}
		}
		obj = an = dt = taskNames = taskFuncs = taskCount = funcQueue = paramQueue = queueCount = currentIndex = isInBrowser = addNew = doTask = doGC = obj = null;
	};

	return obj = {
		isTaskProtoExists: function(taskName, callback) {
			if (!!isDisposed) {
				return;
			}
			callback.call(obj, taskNames.indexOf(taskName) > -1);

			return obj;
		},
		addNewTaskProto: function(taskName, taskFunc, replaceIfExists) {
			if (!!isDisposed) {
				return;
			}
			addNew(taskName, taskFunc, replaceIfExists);

			return obj;
		},
		addTaskToQueue: function(taskName, params) {
			if (!!isDisposed) {
				return;
			}
			funcQueue[queueCount] = taskName;
			paramQueue[queueCount] = params;
			queueCount++;

			doTask(taskName, params);

			return obj;
		},
		dispose: doGC
	};
});