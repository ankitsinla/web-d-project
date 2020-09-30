var mongoose = require("mongoose");

var StdSchema = new mongoose.Schema({
	name:String,
	rollno:String,
	fathername:String,
	collegeId:String,
	mobileNum:String,
	id:{
		type: mongoose.Schema.Types.ObjectId,
        ref: "User"
	}
});

module.exports = mongoose.model("Student",StdSchema);