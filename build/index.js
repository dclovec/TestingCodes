var CommentBox = React.createClass({
	getInitialState: function () {
		return { data: [] };
	},
	componentDidMount: function () {
		var me = this;
		me.setState({ data: data });
		window.setTimeout(me.loadAdded, 3000);
	},
	render: function () {
		return React.createElement(
			"div",
			{ className: "cbox" },
			React.createElement(
				"h3",
				null,
				"this is a comment box."
			),
			React.createElement(
				"h6",
				null,
				this.props.time
			),
			this.props.children,
			React.createElement(CommentList, { data: this.state.data }),
			React.createElement(CommentForm, { onInvoke: this.addCurrent })
		);
	},
	loadAdded: function () {
		this.setState({ data: added });
	},
	addCurrent: function (comment) {
		var s = this.state.data;
		this.setState({ data: -1 !== s.push(-1 !== (comment.id = s.length) && comment) && s });
	}
});
var CommentList = React.createClass({
	render: function () {
		var cts = this.props.data.map(function (item) {
			return React.createElement(
				"p",
				{ author: item.name, age: item.age, uid: item.id },
				item.msg
			);
		});
		return React.createElement(
			"div",
			{ className: "commentList" },
			React.createElement(
				"h4",
				null,
				"Hello, world! I am a CommentList."
			),
			cts
		);
	}
});
var CommentForm = React.createClass({
	getInitialState: function () {
		return {};
	},
	add: function (e) {
		e.preventDefault();
		var form = document.body.querySelector(".commentForm"),
		    name = form.querySelector(".nameC"),
		    age = form.querySelector(".ageC"),
		    msg = form.querySelector(".msgC"),
		    obj = { name: name.value, age: +age.value, msg: msg.value };
		this.props.onInvoke(obj);
		this.setState(this.getInitialState());
		name.value = "";
		age.value = "";
		msg.value = "";
	},
	render: function () {
		return React.createElement(
			"div",
			{ className: "commentForm" },
			React.createElement(
				"h4",
				null,
				"Hello, world! I am a CommentForm."
			),
			React.createElement(
				"form",
				null,
				React.createElement("input", { className: "nameC", type: "text", value: this.state.name, placeholder: "enter name" }),
				React.createElement("br", null),
				React.createElement("input", { className: "ageC", type: "number", value: this.state.age, placeholder: "enter age" }),
				React.createElement("br", null),
				React.createElement("input", { className: "msgC", type: "text", value: this.state.msg, placeholder: "enter message" })
			),
			React.createElement("br", null),
			React.createElement(
				"button",
				{ onClick: this.add },
				"submit"
			)
		);
	}
});

var data = [{
	id: 0,
	name: "robin",
	age: 27,
	msg: "I am robin, I like program."
}, {
	id: 1,
	name: "alex",
	age: 20,
	msg: "I am alex, I like play e-game."
}, {
	id: 2,
	name: "sazer",
	age: 7,
	msg: "I am sazer, I like climb trees."
}],
    added = data.concat([{
	id: 3,
	name: "sberg",
	age: 47,
	msg: "I am sberg, I like films."
}, {
	id: 4,
	name: "jorden",
	age: 50,
	msg: "I am jorden, I like basketball."
}]);

ReactDOM.render(React.createElement(
	"h1",
	null,
	" Hello, React! "
), div);
ReactDOM.render(React.createElement(
	CommentBox,
	{ time: "2016-06-29" },
	"this is content of cbox"
), bd);