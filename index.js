var express = require("express");
var bodyParser = require("body-parser");
var app = express();
const mongoose = require('mongoose')
var node_xj = require("xls-to-json");
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
User = mongoose.model('User',userSchema)


//用户列表
app.get("/api/user/List",(req,res)=>{
	User.find().select('-password').then(result=>{
		let total = result.length;
		let data = util.returnData({
			userList:result,
	        total:total
		})
	    res.end(JSON.stringify(data));
	})
})
/*	User.find($findParams).skip((params.pageNum-1)*params.pageSize).limit(Number(params.pageSize)).then(result=>{
		total = result.length;
		let data = util.returnData({
			userList:result,
	        total:total
		})
	    res.end(JSON.stringify(data));
	})*/
//搜索列表
app.post("/api/user/searchList",(req,res)=>{
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
		let data = util.returnData({
			userList:result,
	        total:total
		})
	    res.end(JSON.stringify(data));
	})
})

//修改用户列表的用户状态
app.post("/api/user/changeStatus",(req,res)=>{
	let id = req.body.id,
		status = req.body.status;
	User.updateOne({_id:id},{status:status}).then(result=>{
		let data = util.returnData({})
	    res.end(JSON.stringify(data));
	})
})

//修改用户的type
app.post("/api/user/changeType",(req,res)=>{
	let id = req.body.id,
		type = req.body.type;
	User.updateOne({_id:id},{type:type}).then(result=>{
		let data = util.returnData({})
	    res.end(JSON.stringify(data));
	})
})


//创建Article规则
const articleSchema = new mongoose.Schema({
	title:String,
	author:String,
	keyword:String,
	coverPlan:String,
	tag:{
		type:mongoose.Schema.Types.ObjectId,//必传规则
		ref:'Label'//关联的表
	},
	classify:{
		type:mongoose.Schema.Types.ObjectId,//必传规则
		ref:'Classify'//关联的表
	},
	untreatedCommentNums:Number,
	interactionNums:Object,
	createTime:Number,
	articleStatus:Number,
	articleType:Number,
	desc:String,
	articleWatch:Number,
	articleLike:Number,
	articleCommon:Number,
	content:String,
	articleOperation:Number
})
Article = mongoose.model('Article',articleSchema)

//写文章
app.post("/api/article/articleWrite",(req,res)=>{
	let $params = JSON.stringify(req.body) || '';
	let params = JSON.parse($params),
		data = {
			...params,
			untreatedCommentNums:0,
			interactionNums:0,
			articleWatch:0,
			articleLike:0,
			articleCommon:0,
			createTime:new Date().getTime(),
			articleOperation:1
		}
	if(params._id){
		Article.update({_id:params._id},{$set:{...params}})
		.then(result=>{
			let data = util.returnData({
	    		message:"更新成功~"
	    	})
	        res.end(JSON.stringify(data));
		})
		.catch(err=>{
			console.log(err)
	        let data = {
	        	info:'返回错误',
				data:null,
				code:400
	        }
	        res.end(JSON.stringify(data));
	    })
	}else{
		Article.create(data)
	    .then(result=>{
	    	let data = util.returnData({
	    		message:"新增成功~"
	    	})
	        res.end(JSON.stringify(data));

	    })
	    .catch(err=>{
	        let data = {
	        	info:'返回错误',
				data:null,
				code:400
	        }
	        res.end(JSON.stringify(data));
	    })
	}
})

//文章列表
app.get("/api/article/articleList",(req,res)=>{
	Article.find().then(result=>{
		for(let i = 0; i < result.length; i++){
			result[i].interactionNums = [result[i].articleWatch,result[i].articleLike,result[i].articleCommon]
		}
		let data = util.returnData({
			articleList:result,
	        total:result.length
		})
	    res.end(JSON.stringify(data));
	})
})

//搜索文章
app.post("/api/article/searchList",(req,res)=>{
	let params = req.body,
		$findParams = {},
		total = 0;
	if(params.keyword != ''){
		$findParams.title = params.keyword
	}
	if(params.type != ''){
		$findParams.type = params.type
	}
	Article.find($findParams).then(result=>{
		total = result.length;
		for(let i = 0; i < result.length; i++){
			result[i].interactionNums = [result[i].articleWatch,result[i].articleLike,result[i].articleCommon]
		}
		let data = util.returnData({
			articleList:result,
	        total:total
		})
	    res.end(JSON.stringify(data));
	})
})

//删除文章
app.post("/api/article/delArticle",(req,res)=>{
	let id = req.body.id;
	Article.findOneAndDelete({_id:id}).then(result=>{
		let data = util.returnData({
    		message:"删除成功~"
    	})
        res.end(JSON.stringify(data));
	})
})

//搜索单个文章
app.post("/api/article/searchOne",(req,res)=>{
	let id = req.body.id;
	Article.findOne({_id:id}).then(result=>{
		let data = util.returnData({
			article:result,
		})
	    res.end(JSON.stringify(data));
	})
})

//修改文章发布状态
app.post("/api/article/changeArticleStatus",(req,res)=>{
	let id = req.body.id,
		articleStatus = req.body.articleStatus;
	Article.updateOne({_id:id},{articleStatus:articleStatus}).then(result=>{
		let data = util.returnData({})
	    res.end(JSON.stringify(data));
	})
}) 

//创建留言板规则
const leaveSchema = new mongoose.Schema({
	user_name:String,
	user_email:String,
	user_image:String,
	leave_desc:String,
	leave_status:Number,
	create_time:Number,
	writeBack:String
})

Leave = mongoose.model('Leave',leaveSchema)

//留言列表
app.get("/api/leave/leaveList",(req,res)=>{
	Leave.find().then(result=>{
		let data = util.returnData({
			leaveList:result,
	        total:result.length
		})
	    res.end(JSON.stringify(data));
	})
})

//回复留言内容
app.post("/api/leave/replyContent",(req,res)=>{
	let id = req.body.id,
		writeBack = req.body.writeBack;
	Leave.updateOne({_id:id},{writeBack:writeBack,leave_status:1}).then(result=>{
		let data = util.returnData({})
	    res.end(JSON.stringify(data));
	})
})

//删除回复留言的内容
app.post("/api/leave/delReplyContent",(req,res)=>{
	let id = req.body.id;
	Leave.updateOne({_id:id},{writeBack:'',leave_status:0}).then(result=>{
		let data = util.returnData({})
	    res.end(JSON.stringify(data));
	})
})

//更新留言显示状态
app.post("/api/leave/settingShow",(req,res)=>{
	let id = req.body.id,
		leave_show = req.body.id;
	Leave.updateOne({_id:id},{leave_show:leave_show}).then(result=>{
		let data = util.returnData({})
	    res.end(JSON.stringify(data));
	})
})

//创建标签规则
const labelSchema = new mongoose.Schema({
	label_name:String,
	article_nums:Number,
	create_time:Number
})

Label = mongoose.model('Label',labelSchema)

//标签列表
app.get("/api/label/labelList",(req,res)=>{
	let params = req.query,
		$findParams = {};
	if(params.keyword){
		$findParams.label_name = params.keyword
	}else{
		$findParams = null;
	}
	Label.find($findParams).then(result=>{
		//查询出来所有的便签
		//循环查询每个便签下的文章数量
		let $result = result,
		nums = 0;
		for(let i =0; i < $result.length; i++){
			Article.find({tag:$result[i]._id}).then($article=>{
				$result[i].article_nums = $article.length;
				Label.updateOne({_id:$result[i]._id},{article_nums:$article.length}).then($label=>{
					console.log($label)
				})
				nums++;
			})
		}
		//循环查询是否已经完成异步查询
		let timer = setInterval(()=>{
			if(nums == $result.length){
				clearInterval(timer);
				let data = util.returnData({
					labelList:result
				})
			    res.end(JSON.stringify(data));
			}
		},10)
	})
})

//新增标签
app.post("/api/label/addLabel",(req,res)=>{
	let data = {
		label_name:req.body.labelName,
		label_Article:0,
		createTime:new Date().getTime(),
	}
	Label.create(data)
	    .then(result=>{
	    	let data = util.returnData({
	    		message:"新增成功~"
	    	})
	        res.end(JSON.stringify(data));
	    })
	    .catch(err=>{
	        let data = {
	        	info:'返回错误',
				data:null,
				code:400
	        }
	        res.end(JSON.stringify(data));
	    })
})
//删除标签
app.post("/api/label/delLabel",(req,res)=>{
	let id = req.body.id;
	Article.find({tag:id}).then(result=>{
		if(result.length == 0){
			Label.findOneAndDelete({_id:id}).then(result=>{
				let data = util.returnData({
		    		message:"删除成功~"
		    	})
		        res.end(JSON.stringify(data));
			})
		}else{
			Label.findOne({label_name:'其它'}).then(resu=>{
				Article.updateMany({tag:id},{tag:resu._id}).then(resul=>{
					Label.findOneAndDelete({_id:id}).then(result=>{
						let data = util.returnData({
				    		message:"该标签下的文章将全部归类到'其它'标签中~~"
				    	})
				        res.end(JSON.stringify(data));
					})
				})
			})
		}
	})
})

//创建分类规则
const classifySchema = new mongoose.Schema({
	classify_name:String,
	article_nums:Number,
	create_time:Number
})

Classify = mongoose.model('Classify',classifySchema)

//分类列表
app.get("/api/classify/classifyList",(req,res)=>{
	let params = req.query,
		$findParams = {};
	if(params.keyword){
		$findParams.classify_name = params.keyword
	}else{
		$findParams = null;
	}
	Classify.find($findParams).then(result=>{
		//查询出来所有的分类
		//循环查询每个分类下的文章数量
		let $result = result,
		nums = 0;
		for(let i =0; i < $result.length; i++){
			Article.find({classify:$result[i]._id}).then($article=>{
				$result[i].article_nums = $article.length;
				Classify.updateOne({_id:$result[i]._id},{article_nums:$article.length}).then($label=>{
					console.log($label)
				})
				nums++;
			})
		}
		//循环查询是否已经完成异步查询
		let timer = setInterval(()=>{
			if(nums == $result.length){
				clearInterval(timer);
				let data = util.returnData({
					classifyList:$result
				})
	    		res.end(JSON.stringify(data));
			}
		},10)
	})
})

//新增分类
app.post("/api/classify/addClassify",(req,res)=>{
	let data = {
		classify_name:req.body.classifyName,
		article_nums:0,
		createTime:new Date().getTime(),
	}
	Classify.create(data)
	    .then(result=>{
	    	let data = util.returnData({
	    		message:"新增成功~"
	    	})
	        res.end(JSON.stringify(data));
	    })
	    .catch(err=>{
	        let data = {
	        	info:'返回错误',
				data:null,
				code:400
	        }
	        res.end(JSON.stringify(data));
	    })
})

//删除分类
app.post("/api/classify/delClassify",(req,res)=>{
	let id = req.body.id;
	Article.find({classify:id}).then(result=>{
		if(result.length == 0){
			Classify.findOneAndDelete({_id:id}).then(result=>{
				let data = util.returnData({
		    		message:"删除成功~"
		    	})
		        res.end(JSON.stringify(data));
			})
		}else{
			Classify.findOne({classify_name:'其它'}).then(resu=>{
				Article.updateMany({classify:id},{classify:resu._id}).then(resul=>{
			    	Classify.findOneAndDelete({_id:id}).then(result=>{
						let data = util.returnData({
				    		message:"该分类下的文章将全部归类到'其它'分类中~",
				    	})
				        res.end(JSON.stringify(data));
					})
				})
				
			})
		}
	})
})

//创建项目规则
const projectSchema = new mongoose.Schema({
	project_name:String,
	project_desc:String,
	project_url:String,
	project_startTime:Number,
	project_endTime:Number,
	project_status:Number,
	createTime:Number
})

Project = mongoose.model('Project',projectSchema)

//写文章
app.post("/api/project/addProject",(req,res)=>{
	let params = req.body,
		data = {
			...params,
			createTime:new Date().getTime(),
		}
	if(params._id){
		Project.update({_id:params._id},{$set:{...params}})
		.then(result=>{
			let data = util.returnData({
	    		message:"更新成功~"
	    	})
	        res.end(JSON.stringify(data));
		})
		.catch(err=>{
	        let data = {
	        	info:'返回错误',
				data:null,
				code:400
	        }
	        res.end(JSON.stringify(data));
	    })
	}else{
		Project.create(data)
	    .then(result=>{
	    	let data = util.returnData({
	    		message:"新增成功~"
	    	})
	        res.end(JSON.stringify(data));
	    })
	    .catch(err=>{
	        let data = {
	        	info:'返回错误',
				data:null,
				code:400
	        }
	        res.end(JSON.stringify(data));
	    })
	}
})

//项目列表
app.get('/api/project/projectList',(req,res)=>{
	Project.find().then(result=>{
		let data = util.returnData({
			projectList:result
		})
	    res.end(JSON.stringify(data));
	})
})

//搜索列表
app.post('/api/project/searchProjectList',(req,res)=>{
	let params = req.body,
		$findParams = {};
	if(params.keyword != ''){
		$findParams.project_name = params.keyword
	}
	if(params.project_status != ''){
		$findParams.project_status = params.project_status
	}
	Project.find($findParams).then(result=>{
		let data = util.returnData({
			projectList:result
		})
	    res.end(JSON.stringify(data));
	})
})

//删除
app.post('/api/project/delProject',(req,res)=>{
	let id = req.body.id;
	Project.findOneAndDelete({_id:id}).then(result=>{
		let data = util.returnData({
    		message:"删除成功~"
    	})
        res.end(JSON.stringify(data));
	})
})
