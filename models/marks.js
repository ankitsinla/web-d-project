var mongoose = require("mongoose");

var marksSchema = new mongoose.Schema({
	stdId:{										//change to stdId
		type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
	},
	percent:{ 
			marks:{type: Number, default: 0 },
			feed:{type: String, default: false }
	},
	subjects:[{
		profId:{
			type: mongoose.Schema.Types.ObjectId,
        	ref: "Professor"
		},
		fterm:{ 
			marks:{type: Number, default: 0 },
			feed:{type: String, default: false }
		},
		sterm:{
			marks:{type: Number, default: 0 },
			feed:{type: String, default: false } 
		},
		internal:{
			marks:{type: Number, default: 0 },
			feed:{type: String, default: false } 
		},
		sem:{
			marks:{type: Number, default: 0 },
			feed:{type: String, default: false } 
		},
		total:{ type: Number, default: 0 }
	}]
}
) 

module.exports = mongoose.model("Mark",marksSchema);