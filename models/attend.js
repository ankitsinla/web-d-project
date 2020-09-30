var mongoose = require("mongoose");

var stdAttendanceSchema = new mongoose.Schema({
	stdId:{
		type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
	},
	data:
		[{
			attendance:[
				{
				attendDate:String,
				status:String
				}
			],
			subject: String,
			totalClasses:{ type: Number, default: 0 },
			classAttended:{ type: Number, default: 0 }
		 }]
	
	});

module.exports = mongoose.model("stdAttendance",stdAttendanceSchema);