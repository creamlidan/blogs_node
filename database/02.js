const mongoose = require('mongoose')
//链接数据库如果数据库没有则会自动创建
mongoose.connect('mongodb://localhost/playground',{useNewUrlParser:true})
	.then(()=>console.log("数据库链接成功"))
	.catch(err=>console.log("数据库链接失败"))

const userSchema = new mongoose.Schema({
	name:{
		type:String,
		required:true
	}
})

const postSchema = new mongoose.Schema({
	title:{
		type:String
	},
	author:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'User'
	}
})

const User = mongoose.model('User',userSchema)
const Post = mongoose.model('Post',postSchema)

/*User.create({name:'itheima'}).then(res=>console.log(res))*/

/*Post.create({title:'123',author:'5d707d6dd665be2b1cd9975e'}).then(res=>console.log(res))
*/
Post.find().populate('author').then(res=>console.log(res))