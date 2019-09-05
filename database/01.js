const mongoose = require('mongoose')
//链接数据库如果数据库没有则会自动创建
mongoose.connect('mongodb://localhost/playground',{useNewUrlParser:true})
	.then(()=>console.log("数据库链接成功"))
	.catch(err=>console.log("数据库链接失败"))

//创建集合规则
const courseSchema = new mongoose.Schema({
	name:String,
	author:String,
	isPublished:Boolean
})
//使用规则创建集合
const Course = mongoose.model('Course',courseSchema)

//需要插入的数据方法1
/*const course = new Course({
	name:'Javascript',
	author:'zhangshan',
	isPublished:false
})*/

//插入数据
/*course.save();*/

//插入数据方法二
/*Course.create({name:'HTML',author:'lisi',isPublished:true},(err,result)=>{
	console.log(err)
	console.log(result)
})*/
const userSchema = new mongoose.Schema({
	name:{
		type:String,
		required:[true,'请输入名字']
	},
	age:Number,
	aihao:Object,
	category:{
		type:String,
		enum:['html','css','js']
	}
})
const User = mongoose.model('User',userSchema)
/*User.find().then(res=>console.log(res))*/
/*User.find({_id:'5d6f352ee768cbefc3a5f4ea'}).then(res=>console.log(res))*/
//User.findOne().then(res=>console.log(res))
//User.find({age:{$gt:18,$lt:30}}).then(res=>console.log(res))
/*User.find({aihao:{$in:['足球']}}).then(res=>console.log(res))*/
/*User.find().select('name age').then(res=>console.log(res))*/
/*User.find().select('name age -_id').then(res=>console.log(res))*/
/*User.find().sort('age').then(res=>console.log(res))*/
/*User.find().sort('-age').then(res=>console.log(res))*/
/*User.find().skip(1).limit(1).then(res=>console.log(res))*/
/*User.findOneAndDelete({_id:'5d6f352ee768cbefc3a5f4ea'}).then(res=>console.log(res))*/
/*User.deleteMany({}).then(res=>console.log(res))*/
/*User.updateOne({name:'网二'},{name:'李丹'}).then(res=>console.log(res))*/
/*User.updateMany({name:'李丹'},{name:'网二'}).then(res=>console.log(res))*/
/*User.updateMany({},{name:'李丹'}).then(res=>console.log(res))*/
User.create({name:'lidan',category:'html'},(err,result)=>{
	console.log(err)
	console.log(result)
})