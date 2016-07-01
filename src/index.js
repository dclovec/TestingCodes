var CommentBox=React.createClass({
	getInitialState:function(){
		return {data:[]};
	},
	componentDidMount:function(){
		var me=this;
		me.setState({data:data});
		window.setTimeout(me.loadAdded,3000);
	},
	render:function () {
		return (
			<div className="cbox">
				<h3>this is a comment box.</h3>
				<h6>{this.props.time}</h6>
				{this.props.children}
				<CommentList data={this.state.data} />
				<CommentForm onInvoke={this.addCurrent} />
			</div>
		);
	},
	loadAdded:function(){
		this.setState({data:added});
	},
	addCurrent:function(comment){
		var s=this.state.data; 
		this.setState({data:(-1!==(s.push(-1!==(comment.id=s.length) && comment)) && s)});
	}
});
var CommentList = React.createClass({
  render: function() {
  	var cts=this.props.data.map(function (item) {
  		return (
  			<p author={item.name} age={item.age} uid={item.id}>{item.msg}</p>
  		);
  	});
    return (
      <div className="commentList">
      	<h4>Hello, world! I am a CommentList.</h4>
      	{cts}
      </div>
    );
  }
});
var CommentForm = React.createClass({
	getInitialState:function(){
		return {};
	},
	add:function(e){
		e.preventDefault();
		var form=document.body.querySelector(".commentForm"),
			name=form.querySelector(".nameC"),
			age=form.querySelector(".ageC"),
			msg=form.querySelector(".msgC"),
			obj={name:name.value,age:+age.value,msg:msg.value};
		this.props.onInvoke(obj);
		this.setState(this.getInitialState());
		name.value="";
		age.value="";
		msg.value="";
	},
	  render: function() {
	    return (
	      <div className="commentForm">
			<h4>Hello, world! I am a CommentForm.</h4>
			<form>
				<input className="nameC" type="text" value={this.state.name} placeholder="enter name" />
				<br />
				<input className="ageC" type="number" value={this.state.age} placeholder="enter age" />
				<br />
				<input className="msgC" type="text" value={this.state.msg} placeholder="enter message" />
			</form>
			<br />
	      	<button onClick={this.add}>submit</button>
	      </div>
	    );
	  }
});


var data=[
	{
		id:0,
		name:"robin",
		age:27,
		msg:"I am robin, I like program."
	},
	{
		id:1,
		name:"alex",
		age:20,
		msg:"I am alex, I like play e-game."
	},
	{
		id:2,
		name:"sazer",
		age:7,
		msg:"I am sazer, I like climb trees."
	}
],
added=data.concat([
	{
		id:3,
		name:"sberg",
		age:47,
		msg:"I am sberg, I like films."
	},
	{
		id:4,
		name:"jorden",
		age:50,
		msg:"I am jorden, I like basketball."
	}
]);

ReactDOM.render( 
	<h1> Hello, React! </h1>,
	div
);
ReactDOM.render(
	<CommentBox time="2016-06-29">this is content of cbox</CommentBox>,
	bd
);
