var mongoose = require("mongoose");

var profSchema = new mongoose.Schema({
	name:String,
	collegeId:String,
	subject:String,
	mobileNum:String,
	email:String,
	id:{
		type: mongoose.Schema.Types.ObjectId,
        ref: "User"
	},
	date:[],
	assignments:[{
		topic : String,
		id:String
	}],
	totalClasses:{ type: Number, default: 0 },
	activeMarksFeed:{type: String, default: false},
	isMarks:{type: String, default: false}
});

module.exports = mongoose.model("Professor",profSchema);