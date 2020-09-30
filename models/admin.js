var mongoose = require("mongoose");

var adminSchema = new mongoose.Schema({
	name:String,
	collegeId:String,
	mobileNum:String,
	id:{
		type: mongoose.Schema.Types.ObjectId,
        ref: "User"
	}
});

module.exports = mongoose.model("Admin",adminSchema);