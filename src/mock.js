var data = [{ category: "Sporting Goods", price: "$49.99", stocked: true, name: "Football" }, { category: "Sporting Goods", price: "$9.99", stocked: true, name: "Baseball" }, { category: "Sporting Goods", price: "$29.99", stocked: false, name: "Basketball" }, { category: "Sporting Goods", price: "$29.99", stocked: false, name: "ipps" }, { category: "Electronics", price: "$99.99", stocked: true, name: "iPod Touch" }, { category: "Electronics", price: "$399.99", stocked: false, name: "iPhone 5" }, { category: "Electronics", price: "$199.99", stocked: true, name: "Nexus 7" }];

var SearchBox = React.createClass({
    getInitialState: function () {
        return { onlyStocked: false, searchTxt: "" };
    },
    render: function () {
    	return (
    		<div className="searchBox">
    			<input type="text" placeholdre="Search..." className="searchTxt" onChange={this.onSearchTxtChangedEvt} />
    			<br />
    			<input type="checkbox" id="onlyCheck" className="isOnlyStocked" onClick={this.onlyStockedClicked} checked={this.state.onlyStocked} />
    			<label for="onlyCheck">Only show stocked</label>
    		</div>
    	);
    },
    componentDidMount: function () {
    },
    onlyStockedClicked: function (e) {
        this.setState({onlyStocked: e.target.checked }, this.searchChangeEvt);
    },
    onSearchTxtChangedEvt: function (e) {
        this.setState({searchTxt: e.target.value }, this.searchChangeEvt);
    },
    searchChangeEvt: function (throttled, win) {
        var cpn;
        function change() {
            throttled = null;
            cpn.props.onSearchChanged(cpn.state);
        }
        return function () {
            cpn = this;
            (cpn.searchChangeEvt = function () {
                throttled !== null && win.clearTimeout(throttled);
                throttled = win.setTimeout(change, 300);
            })();
        };
    }(null, window)
}),
    ProductInfo = React.createClass({
    getInitialState: function () {
        return { data: [] };
    },
    render: function () {
        var cats = {},
            index = 0,
            nodes;
        this.state.data.map(function (item) {
            var cat, html;
            if (!((cat = item.category) in cats) || !cats.hasOwnProperty(cat)) {
                html = React.createElement(
                    "tr",
                    { key: index++ },
                    React.createElement(
                        "th",
                        null,
                        cat
                    )
                );
                cats[cat] = [html];
            }
            cats[cat].push(React.createElement(
                "tr",
                { key: index++ },
                React.createElement(
                    "td",
                    { style: item.stocked ? null : { color: "#f00" } },
                    item.name
                ),
                React.createElement(
                    "td",
                    null,
                    item.price
                )
            ));
        });
        nodes = [];
        for (var key in cats) {
            if (cats.hasOwnProperty(key)) {
                nodes = nodes.concat(cats[key]);
            }
        }

        return React.createElement(
            "div",
            { className: "productInfos" },
            React.createElement(SearchBox, { onSearchChanged: this.onSearchInfoChanged }),
            React.createElement(
                "table",
                { className: "productList" },
                React.createElement(
                    "thead",
                    null,
                    React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "th",
                            null,
                            "Name"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "Price"
                        )
                    )
                ),
                React.createElement(
                    "tbody",
                    null,
                    nodes
                )
            )
        );
    },
    componentDidMount: function () {
        this.setState({ data: this.allData = data });
    },
    onSearchInfoChanged: function (info) {
        var shown = this.allData,
            onlyStocked = info.onlyStocked,
            searchTxt = info.searchTxt;
        searchTxt = typeof searchTxt === "string" && searchTxt.length > 0 && new RegExp(searchTxt, "i") || null;
        shown = shown.filter(function (item) {
            return (onlyStocked ? item.stocked : true) && (!searchTxt || searchTxt.test(item.category) || searchTxt.test(item.price) || searchTxt.test(item.name));
        });
        this.setState({ data: shown });
    }
});

ReactDOM.render(React.createElement(ProductInfo, null), container);