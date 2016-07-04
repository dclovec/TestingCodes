var baiduMap = (function(window, document) {
	var pObj,
		bdMap,
		datas;

	pObj = {
		forInner: {
			geoConvToBaidu: function(bdGeo) {
				bdGeo = bdGeo.result[0];
				bdGeo = {
					bdLng: bdGeo.x,
					bdLat: bdGeo.y
				};
				var map = new BMap.Map("middleLay", {
					enableMapClick: false
				});
				map.centerAndZoom(new BMap.Point(bdGeo.bdLng, bdGeo.bdLat), 15);
				map.addControl(new BMap.ZoomControl());
				map.addControl(new BMap.ScaleControl());

				map.disableDragging();
			}
		}
	};

	var earthGrids = (function(win, doc) {
		var width = win.innerWidth,
			root = win.upperBox.querySelector(".grids"),
			existsGridRows = 0,
			columns = 5,
			gridWidth = ~~(width / columns),
			gridHeight = gridWidth,
			hiddenNodes = [],
			shownRows = 0,
			draw,
			gridClickEvt;

		doc.head.innerHTML += "<style>.grid{height:" + gridHeight + "px;}</style>";

		gridClickEvt=function(rowIndex, columnIndex) {
			console.log("click row " + rowIndex + ", column " + columnIndex);
		};

		function evtClick(e) {
			var cn = e.target.getAttribute("data-rci").split(",");
			gridClickEvt(+cn[0], +cn[1]);
		}
		root.addEventListener("click", evtClick);

		(function() {
			var needAddRows,
				nodes,
				rowIndex,
				columnIndex,
				allColumns = columns + 1,
				rootEl=root,
				node;

			shownRows = ~~(parseInt(computedStyles(rootEl).get("height")) / gridHeight);
			
			if (0 < (needAddRows = (shownRows - existsGridRows))) {
				/*add some rows*/
				shownRows += 2;
				nodes = "";
				for (rowIndex = existsGridRows; rowIndex < shownRows; rowIndex++) {
					for (columnIndex = 0; columnIndex < allColumns; columnIndex++) {
						nodes += "<li data-rci=\"" + rowIndex + "," + columnIndex + "\" class=\"grid\"></li>";
					}
				}
				while (!!(node = hiddenNodes.shift())) {
					node.style.display = "block";
				}
				rootEl.innerHTML += nodes;
				existsGridRows = shownRows - 1;
			}
			
			(draw=function () {
				rootEl.style.top="0";
				rootEl.style.left="0";
			})();
		})();

		return {
			show:function(){
				root.style.display="block";
			},
			hide:function(){
				root.style.display="none";
			},
			drawGrid: draw,
			setGridClickEvent:function (func) {
				(typeof func==="function") && (gridClickEvt=func);
			}
		};
	})(window, document);

	function calcBoxIdByLocation(bdGeo) {
		var lng = bdGeo.lng,
			lat = bdGeo.lat,
			lngRange = [73.33, 135.05],
			/*gps location*/
			latRange = [3.51, 53.33],
			/*gps location*/
			yD,
			xD,
			splitSize,
			halfSplitSize,
			yIndex,
			yTmp,
			xIndex,
			xTmp,
			centerPosY,
			centerPosX;

		lngRange = [73.339632494327, 135.06613571461]; /*to baidu location*/
		latRange = [3.5159320630689, 53.338015624402] /*to baidu location*/
		if (lngRange[0] <= lng && lng <= lngRange[1] && latRange[0] <= lat && lat <= latRange[1]) {
			yD = 111000 * (lat - latRange[0]);
			xD = Math.abs(Math.cos(lat)) * 111000 * (lng - lngRange[0]);
			splitSize = 200;
			halfSplitSize = 0.5 * splitSize;
			yIndex = yD / splitSize;
			yTmp = ~~yIndex;
			xIndex = xD / splitSize;
			xTmp = ~~xIndex;
			yIndex = (yIndex > yTmp ? (yTmp + 1) : yTmp);
			centerPosY = (splitSize * yIndex + halfSplitSize) - yD;
			Math.abs(centerPosY) > halfSplitSize && (centerPosY = centerPosY > 0 ? halfSplitSize : (-halfSplitSize));
			centerPosY = 0.00001 * centerPosY + lat;

			xIndex = (xIndex > xTmp ? (xTmp + 1) : xTmp);
			centerPosX = (splitSize * xIndex + halfSplitSize) - xD;
			Math.abs(centerPosX) > halfSplitSize && (centerPosX = centerPosX > 0 ? halfSplitSize : (-halfSplitSize));
			centerPosX = 0.00001 * centerPosX + lng;

			return {
				xIndex: xIndex,
				yIndex: yIndex,
				boxCenterPos: {
					bdLng: centerPosX,
					bdLat: centerPosY
				}
			};
		} else {
			alert("location data error.");
		}
	}

	function geoConvToBaidu(coords, callback) {
		var lng = coords.longitude,
			lat = coords.latitude,
			script = document.createElement("script"),
			cbFuncName = "geoConv" + Date.now(),
			cbFunc = "baiduMap.forInner." + cbFuncName;
		!!callback && (pObj.forInner[cbFuncName] = callback);
		script.async = true;
		script.onerror = function(e) {
			callback({
				err: 1,
				result: e
			});
			console.log("error request (geoconv):", e);
		};
		script.src = "http://api.map.baidu.com/geoconv/v1/?coords=" + lng + "," + lat + "&from=1&to=5&ak=27WpZtvmsCkUNPOrDuq3BrxuFCypaPX8&callback=" + cbFunc;
		document.body.appendChild(script);
	}

	function initBdMap(bdGeo) {
		//				geoBaiduToAddr(bdGeo);
		//				geoBaiduStaticImg(bdGeo);
		var bdLng,
			bdLat;
		bdGeo = bdGeo.result[0];
		bdLng = bdGeo.x;
		bdLat = bdGeo.y;
		bdMap = new BMap.Map("mapLay", {
			enableMapClick: false
		});
		bdMap.centerAndZoom(new BMap.Point(bdLng, bdLat), 16);
		bdMap.disableDragging();
		bdMap.addControl(new BMap.ScaleControl());
		var marker = new BMap.Marker(new BMap.Point(bdLng, bdLat)); //创建标注
		bdMap.addOverlay(marker); // 将标注添加到地图中
		datas.baiduPosition = {
			lng: bdLng,
			lat: bdLat
		};
	}

	function geoLocation(callback) {
		navigator.geolocation.getCurrentPosition(function(pos) {
			(typeof callback === "function") && callback(pos);
			datas.nativePostion = pos;
		}, function(err) {
			console.log("error get position(getCurrentPosition):", err);
			(typeof callback === "function") && callback(err);
		});
	}

	function error(msg) {
		alert("错误：\n" + JSON.stringify(msg));
		initBdMap({
			result: [{
				x: 106.51155987542997,
				y: 29.538849618394718
			}]
		});
	}

	function init() {
		geoLocation(function(pos) {
			!!pos.coords ? geoConvToBaidu(pos.coords, initBdMap) : error(pos);
		});
		datas = {};
	}

	init();

	return pObj;
})(window, document);