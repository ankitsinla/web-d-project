var mongoose = require("mongoose");

var dataSchema = new mongoose.Schema({
	students:[{
		userId:String,
		password:String,
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Student"
		},
		isRegister:{type:String,default:'false'}
	}],
	professors:[{
		userId:String,
		password:String,
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Professor"
		},
		isRegister:{type:String,default:'false'}
	}],
	admin:[{
		userId:{type:String, default:"admin"},
		password:{type:String, default:"pass"},
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Admin"
		},
		isRegister:{type:String,default:'false'}
	}]
});

module.exports = mongoose.model("Data",dataSchema);