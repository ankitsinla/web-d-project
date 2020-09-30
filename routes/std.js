var express = require("express");
var router = express.Router();
var Student=require("../models/std");
var User =require("../models/user");
var Atd =require("../models/attend");
var Prof=require("../models/prof");
var Marks=require("../models/marks");


var methodOverride=require("method-override");

router.use(methodOverride("_method"));


router.get("/std/check",function(req,res){
	Student.findOne({id:req.user._id},function(err,student){
		if(student == undefined){
			req.logout();
			req.flash("error","Invalid Student Credientials!");
			res.redirect("/login/student")
		}else{
			req.flash("success","Successfully logged In");
			res.redirect("/std/profile");
		}
	})
})

router.get("/std/profile",isStdLoggedIn,function(req,res){
	Student.findOne({id:req.user._id},function(err,std){
		if(err){
			console.log(err);
			res.redirect("/");
		}else{
			res.render("../views/student/index",{std:std});
		}
	})
})

router.get("/std/profile/edit", isStdLoggedIn,function(req,res){
	res.render("../views/student/editProfile");
})


router.get("/std/:id/edit", isStdLoggedIn,function(req,res){ 		///change it  //done
	Student.findById(req.params.id,function(err,std){
		res.render("../views/student/edit",{std:std});
	})
})

router.put("/std/:id", isStdLoggedIn,function(req,res){
	Student.findByIdAndUpdate(req.params.id, req.body.std,function(err,finduser){
		if(err){
			console.log(err)
		}else{
			res.redirect("/std/profile")
		}
	})
})


router.get("/std/:id/attendance", isStdLoggedIn,function(req,res){
	Atd.findOne({stdId:req.params.id},function(err,stdatd){
		Prof.find({},function(err,profs){
			res.render("../views/student/attendance",{stdatd:stdatd,profs:profs});
		})
	})
})

router.get("/std/:id/fullAttend/:sub",function(req,res){
	Atd.findOne({stdId:req.params.id},function(err,stdAtd){
		stdAtd.data.forEach(function(stdatd){
			if(stdatd.subject == req.params.sub){
				res.render("../views/student/fullAttendance",{stdId:req.params.id,stdatd:stdatd,subject:req.params.sub});
			}
		})
	})
})

router.get("/std/:id/marks",function(req,res){
	Marks.findOne({stdId:req.params.id},function(err,std){
		Prof.find({},function(er,prof){
			res.render("../views/student/marksSubjects",{marks:std,profs:prof});
		})
	})
})


router.get("/std/:id/marks/:sub",function(req,res){
	Marks.findOne({stdId:req.params.id},function(err,std){
		Prof.findOne({subject:req.params.sub},function(er,prof){
			std.subjects.forEach(function(subj){
				if(subj.profId.equals(prof._id)){
					res.render("../views/student/marks",{stdId:req.params.id,subject:subj,prof:prof})
				}
			})
		})
			
		
	})
})

router.get("/std/:id/assignments",function(req,res){
	res.redirect("/std/:id/assignments/prof");
})


function isStdLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		Student.findOne({id:req.user._id},function(err,student){
			if(student == undefined){
				req.logout();
				res.redirect("/login/student");
			}else{
				return next();
			}
		})
	}
	else{
		req.flash("error","Please login first!");
		res.redirect("/login/student");
	}
}

module.exports= router;