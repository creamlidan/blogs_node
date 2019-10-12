var express = require("express");
var bodyParser = require("body-parser");
var app = express();
const mongoose = require('mongoose')
var util = require('./public/util');
//链接数据库如果数据库没有则会自动创建
mongoose.connect('mongodb://localhost/blogs',{useNewUrlParser:true})
	.then(()=>console.log("数据库链接成功"))
	.catch(err=>console.log("数据库链接失败"))

//实现跨域
app.use(function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    next()
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({limit:'10mb'}))
app.use(bodyParser.json())


app.listen(8088,function(){
    console.log('启动服务了')
})


//创建user规则
const userSchema = new mongoose.Schema({
	name:String,
	email:String,
	password:String,
	image:String,
	type:Number,
	status:Number,
	create_time:Number
})
const User = mongoose.model('User',userSchema)

//用户列表
app.get("/api/user/List",function(req,res){
	User.find().then(result=>{
		let data = util.returnData({
			userList:result,
	        total:result.length
		})
	    res.end(JSON.stringify(data));
	})
})
//搜索列表
app.post("/api/user/searchList",function(req,res){
	let params = req.body,
		$findParams = {},
		total = 0;
	if(params.keyword != ''){
		$findParams.name = params.keyword
	}
	if(params.type != ''){
		$findParams.type = params.type
	}
	User.find($findParams).then(result=>{
		total = result.length;
		User.find($findParams).skip((params.pageNum-1)*params.pageSize).limit(Number(params.pageSize)).then(result=>{
			let data = util.returnData({
				userList:result,
		        total:total
			})
		    res.end(JSON.stringify(data));
		})
	})
})

//修改用户列表的用户状态
app.post("/api/user/changeStatus",function(req,res){
	let id = req.body.id,
		status = req.body.status;
		console.log(status)
	User.findOne({_id:id},{status:status}).then(result=>{
		let data = util.returnData({})
	    res.end(JSON.stringify(data));
	})
})

