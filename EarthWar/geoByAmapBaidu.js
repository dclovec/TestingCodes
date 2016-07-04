!!window && (function(window, func) {
	if (typeof define === 'function' && define.amd) {
		define(func);
	} else if (typeof exports === 'object') {
		module.exports = func;
	} else {
		window.geoByAmapBaidu = func();
	}
})(window, function() {
	var win,
		doc,
		cb,
		errInfos,
		config,
		amap,
		geoWatchCb,
		watcherCount,
		wId,
		publicObj;

	if (!Array.prototype.clear) {
		Array.prototype.clear = function() {
			var me = this,
				len = me.length;
			while (len-- > -1) {
				me.pop();
			}
		};
	}

	function init(cba) {

		init = null;
		win = window;
		doc = document;
		cb = [];
		addrCb = [];
		geoWatchCb = [];
		watcherCount = 0;
		errInfos = {
			loadAmap: {
				err: 1,
				msg: "初始化数据失败(获取Amap js api失败)"
			},
			getLocaDataFromAmap: {
				err: 2,
				msg: "获取位置信息失败(从amap)"
			},
			transLocaFromAmapToBaidu: {
				err: 3,
				msg: "转换amap坐标到百度坐标失败"
			},
			locaToAddr: {
				err: 4,
				msg: "坐标转换到地址失败"
			}
		};

//		var node;
//		node = doc.createElement("script");
//		node.src = "http://webapi.amap.com/maps?v=1.3&key=" + config.amapKey;
//		node.async = true;
//		node.onload = function() {
//			window.setTimeout(function() {
//				getLocationFromAmap(cba);
//			}, 17);
//		};
//		node.onerror = function() {
//			callCB(errInfos.loadAmap);
//			cb.clear();
//		};
//		doc.body.appendChild(node);
				ajaxTool.setConfig({
					async: true,
					method: "GET",
					success: function(data) {
						var end=data.indexOf("if",data.indexOf("ib")+1),
							js=data.slice(0,end);
						data =js+ data.slice(data.indexOf(";",data.lastIndexOf("hb")+1)+1,data.length);
						(new Function(data))();
						getLocationFromAmap(cba);
					},
					error: function(xhr) {
						console.error(xhr);
						callCB(errInfos.loadAmap);
						cb.clear();
					}
				}).request("http://webapi.amap.com/maps?v=1.3&key=" + config.amapKey, null)
	}

	function callCB(data) {
		var len,
			i;
		if (0 < (len = cb.length)) {
			for (i = 0; i < len; i++) {
				(cb[i])(data);
			}
			cb.clear();
		}
		if (0 < (len = geoWatchCb.length)) {
			for (i = 0; i < len; i++) {
				(geoWatchCb[i])(data);
			}
		}
	}

	function getLocationFromAmap(cba) {
		AMap.plugin('AMap.Geolocation', function() {
			amap = new AMap.Geolocation({
				timeout: 60000, //超过10秒后停止定位，默认：无穷大
				maximumAge: 0, //定位结果缓存0毫秒，默认：0
				convert: true, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
				showButton: false, //显示定位按钮，默认：true
				buttonPosition: 'LB', //定位按钮停靠位置，默认：'LB'，左下角
//				buttonOffset: new AMap.Pixel(10, 20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
				showMarker: false, //定位成功后在定位到的位置显示点标记，默认：true
				showCircle: false, //定位成功后用圆圈表示定位精度范围，默认：true
				panToLocation: false, //定位成功后将定位到的位置作为地图中心点，默认：true
				zoomToAccuracy: false //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
			});
			AMap.event.addListener(amap, 'complete', function(loca) {
				var errinfo;
				if ("SUCCESS" === loca.info.toUpperCase()) {
					/*TODO:*/
					win.setTimeout(function() {
						getAddressFromBaidu(loca.position);
					}, 17);
				} else {
					errinfo = errInfos.getLocaDataFromAmap;
					callCB({
						err: errinfo.err,
						msg: errinfo.msg,
						trace: loca.info
					}); /*从amap获取位置信息失败*/
				}
			});
			AMap.event.addListener(amap, 'error', function(error) {
				var errinfo = errInfos.getLocaDataFromAmap;
				callCB({
					err: errinfo.err,
					msg: errinfo.msg,
					trace: error
				});
			});
			!!cba && cba();
		});
	}

	function getAddressFromBaidu(amapLoca) {
		var node = doc.createElement("script");
		node.src = "http://api.map.baidu.com/geoconv/v1/?coords=" + amapLoca.toString() + "&ak=27WpZtvmsCkUNPOrDuq3BrxuFCypaPX8&from=3&to=5&callback=geoByAmapBaidu.innerUseCallback.getTransAmapLocaToBaidu";
		node.async = true;
		node.onerror = function() {
			callCB(node, errInfos.transLocaFromAmapToBaidu);
		};
		node.onload = null;
		doc.body.appendChild(node);
	}

	function watch(callback) {
		return typeof callback === "function" ? (-1 !== (geoWatchCb[watcherCount] = callback) && watcherCount++) : null;
	}

	function setWatch() {
		wId = amap.watchPosition();
		publicObj.watch = watch;
	}

	function rmWather(watcherId) {
		var len;
		if (-1 < watcherId && watcherId < (len = geoWatchCb.length)) {
			if (1 === len) {
				amap.clearWatch(wId);
				geoWatchCb.clear();
				wId = null;
				publicObj.watch = function(callback) {
					watch(callback);
					setWatch();
				};
			} else {
				geoWatchCb.splice(watcherId, 1);
			}
		}
		return publicObj;
	}

	function addLocaCb(callback) {
		!!callback && (cb[cb.length] = callback);
	}

	return publicObj = {
		get: function(callback) {
			if (!!init) {
				init(function() {
					publicObj.getLocation = function(callback) {
						addLocaCb(callback);
						amap.getCurrentPosition();
						return publicObj;
					};
					amap.getCurrentPosition();
				});
			}
			addLocaCb(callback);
			(!!amap) && amap.getCurrentPosition();
			return publicObj;
		},
		watch: function(callback) {
			var id;
			if (!!callback) {
				if (!!init) {
					init(function() {
						setWatch();
					});
					id = watch(callback);
				} else if (!!amap) {
					id = watch(callback);
					setWatch();
				} else {
					id = watch(callback);
				}
				return id;
			}
		},
		removeWatcher: function(watcherId) {
			if (!init) {
				publicObj.removeWatcher = rmWather;
				rmWather(watcherId);
			}
			return publicObj;
		},
		clearAllWatcher: function() {
			if (0 < watcherCount) {
				amap.clearWatch(wId);
				geoWatchCb.clear();
				wId = null;
			}
			return publicObj;
		},
		setConfig: function(conf) {
			!config && (config = {});
			config.amapKey = conf.amapKey;
			config.baiduMapKey = conf.baiduMapKey;
		},
		innerUseCallback: {
			getTransAmapLocaToBaidu: function(baiduLoca) {
				var node,
					sec;
				if (0 === (node = +baiduLoca.status)) {
					node = doc.createElement("script");
					node.async = true;

					baiduLoca = baiduLoca.result[0];
					baiduLoca = {
						lng: baiduLoca.x,
						lat: baiduLoca.y,
						toBaiduGeoCodeString: function() {
							return this.lat + "," + this.lng;
						}
					};

					node.src = "http://api.map.baidu.com/geocoder/v2/?ak=27WpZtvmsCkUNPOrDuq3BrxuFCypaPX8&location=" + baiduLoca.toBaiduGeoCodeString() + "&output=json&callback=geoByAmapBaidu.innerUseCallback.getAddrFromBaidu";
					node.onerror = function() {
						callCB(errInfoss.locaToAddr);
					};
					doc.body.appendChild(node);
				} else {
					node = ([
						null,
						"百度服务内部错误",
						"参数from非法",
						"参数to非法",
						"coords(坐标)格式非法",
						"coords(坐标)个数超过限制",
					])[node];
					sec = errInfos.transLocaFromAmapToBaidu;
					callCB({
						err: sec.err,
						msg: sec.msg,
						trace: node
					});
				}
			},
			getAddrFromBaidu: function(data) {
				var code,
					sec;
				if (0 === (code = +data.status)) {
					code = data.result;
					code.staticImgInfo = {
						copy: "1"
					};
					code.setDefaultStaticImgInfo = function(info) {
						var dsii = code.staticImgInfo,
							value;
						!!(value = info.copy) && (dsii.copy = value);
						!!(value = info.width) && (dsii.width = value);
						!!(value = info.height) && (dsii.height = value);
						!!(value = info.zoom) && (dsii.zoom = value);
						return code;
					};
					code.getStaticImgUrl = function(imgInfo) {
						var sii = code.staticImgInfo;
						!imgInfo && (imgInfo = {});
						return "http://api.map.baidu.com/staticimage/v2?ak=" + config.baiduMapKey + "&copyright=" + (imgInfo.copy || sii.copy) + "&width=" + (imgInfo.width || sii.width) + "&height=" + (imgInfo.height || sii.height) + "&zoom=" + (imgInfo.zoom || sii.zoom) + "&center=" + (imgInfo.center || (code.location.lng + "," + code.location.lat));
					}
					callCB(code);
				} else {
					code = ({
						1: "百度服务内部错误",
						2: "请求参数非法",
						3: "权限校验失败",
						4: "配额校验失败",
						5: "ak不存在或者非法",
						101: "服务禁用",
						102: "未授权或者安全码不对",
						200: "无权限",
						300: "配额错误"
					})[code < 200 ? code : (~~(code / 100) * 100)];
					sec = errInfos.locaToAddr;
					callCB({
						err: sec.err,
						msg: sec.msg,
						trace: code
					});
				}
			}
		}
	};
});