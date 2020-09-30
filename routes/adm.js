var express = require("express");
var router = express.Router();
var passport = require("passport");
var User     =require("../models/user");
var Student  =require("../models/std");
var Prof     =require("../models/prof");
var Atd     =require("../models/attend");
var Admin   =require("../models/admin");
var Marks =require("../models/marks");
var Data =require("../models/database");
var mongodb = require("mongodb");
//var methodOverride=require("method-override");

router.get("/admin/check",function(req,res){
	var flag =0;
	Admin.findOne({id:req.user._id},function(err,admin){
		if(admin== undefined){
			req.logout();
			res.redirect("/login/admin");
		}else{
			res.redirect("/admin")
		}
	})
})

router.get("/admin/signup",function(req,res){
	res.render("../views/adminSignup")
})

router.post("/admin/signup",function(req,res){
	var newUser=new User({username: req.body.username});
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			console.log(err);
			return res.redirect("/register");
		}else{
			passport.authenticate("local")(req,res,function(){
				Data.create({
					admin:[
						{
							userId:req.body.username,
							password:req.body.password
						}
					],
					students:[],
					professors:[]
				})	
				res.redirect("/admin/profile/edit")
			})
		}
		
	})
})

router.get("/admin",function(req,res){
	res.render("../views/admin/index");
})

router.get("/admin/profile/edit",function(req,res){
	res.render("../views/admin/profileEdit");
})

router.get("/admin/students/dataList",function(req,res){
	Student.find({},function(err,students){
		Data.find({},function(err,record){
			record.forEach(function(list){
				res.render("../views/admin/stdList",{list:list.students,students:students})
			})
		})
	})
	
})

router.get("/admin/professors/dataList",function(req,res){
	Prof.find({},function(err,profs){
		Data.find({},function(err,record){
			record.forEach(function(list){
				res.render("../views/admin/profList",{list:list.professors,profs:profs})
			})
		})
	})
})

router.post("/admin/profile/edit",function(req,res){
	Admin.create(req.body.adm,function(err,newAdmin){
		if(err){
			console.log(err);
			res.redirect("/admin/profile/edit");
		} else{
			newAdmin.id=req.user._id;
			newAdmin.save();
		}
	})
	res.render("../views/admin/index");
})

router.get("/admin/professors",function(req,res){
	Prof.find({},function(err,profs){
		res.render("../views/admin/professors",{Profs:profs})
	})
})



router.get("/admin/prof/:id/lectureDates",function(req,res){
	Prof.findById(req.params.id,function(err,prof){
		res.render("../views/admin/profLectures",{prof:prof})
	})
})

router.get("/admin/prof/:id/atend/:dt",function(req,res){
	Prof.findById(req.params.id,function(err,prof){
		Atd.find({},function(err,attendance){
			Student.find({},function(err,students){
				res.render("../views/admin/lectureAttend",{prof:prof,attendance:attendance,students:students,date:req.params.dt})
			})
		})
	})
})

router.get("/admin/students",function(req,res){
	Student.find({},function(err,students){
		Marks.find({},function(err,marks){
			Prof.find({},function(err,profs){
				res.render("../views/admin/students",{students:students,marks:marks,profs:profs})
			})
			
		})
		
	})
})


router.get("/admin/stdinfo/:id",function(req,res){
	Student.findById(req.params.id,function(err,foundStd){
		Atd.findOne({stdId:req.params.id},function(err,attendStd){
			console.log(attendStd)
			Marks.findOne({stdId:req.params.id},function(err,marksStd){
				Prof.find({},function(err,profs){
					res.render("../views/admin/stdinfo",{std:foundStd, attendStd:attendStd, marksStd:marksStd ,profs:profs})
				})
			})
		})
	})
})

router.get("/admin/stdinfo/:id/attend/:sub",function(req,res){
	Student.findById(req.params.id,function(err,student){
		Atd.findOne({stdId:req.params.id},function(err,std){
			std.data.forEach(function(attend){
				if(attend.subject == req.params.sub){
					res.render("../views/admin/stdAttend",{sub:attend,student:student})
				}
			})
		})
	})
		
})

router.get("/admin/students/score",function(req,res){   //done
	Marks.find({},function(err,stdMarks){
		Prof.find({},function(err,profs){
			Student.find({},function(err,students){
				res.render("../views/admin/scoreCard",{stdmarks:stdMarks,profs:profs,students:students});
			})
		})
	})
	
})

router.post("/admin/activeFeed",function(req,res){
	Prof.find({},function(err,profs){
		profs.forEach(function(prof){
			prof.activeMarksFeed=req.body.exam;
			prof.save();
		})
	})
	res.redirect("/admin");
})

router.get("/admin/students/attendance",function(req,res){   
	Atd.find({},function(err,attendance){
		Prof.find({},function(err,profs){
			Student.find({},function(err,students){
				res.render("../views/admin/fullAttend",{attendance:attendance,profs:profs,students:students});
			})
		})
	})
	//res.render("../views/admin/fullAttend");
})

router.get("/admin/:newuser/new",function(req,res){
	res.render("../views/newUser",{newuser:req.params.newuser});
})


router.post("/admin/:newuser/new",function(req,res){
	var isProf =false;
	var isStd  =false;
	Data.find({},function(err,databases){               //checking for std and profs
		databases.forEach(function(database){
			if(req.params.newuser == "student"){
				if(database.professors.length > 0){
					isProf= true;
				} 
			}else{
				if(database.students.length > 0){
					isStd= true;
				} 
			}
		}) 
	})

	if(req.params.newuser == "professor"){
		Prof.create(req.body.users,function(err,newProf){
			if(err){
				console.log(err);
				res.redirect("/admin");
			} else{
				var data ={
					userId:req.body.users.collegeId,
					password:req.body.password,
					id:newProf._id
				}
				Data.find({},function(err,databases){               //adding id for profs
					databases.forEach(function(database){
						database.professors.push(data);
						database.save();
					}) 
				})
				if(isStd){
					var attendData = {
						subject:newProf.subject,
						attendance:[]
					}
					var markData = {
						profId:newProf._id
					}
					Atd.find({},function(err,students){
						students.forEach(function(student){
							student.data.push(attendData);
							student.save();
						})
					})
					Marks.find({},function(err,marksheets){
						marksheets.forEach(function(marksheet){
							marksheet.subjects.push(markData);
							marksheet.save();
						})
					})
				}
				res.redirect("/admin/professor/new");
			}
		})
	}
	else{
		Student.create(req.body.users,function(err,newStd){
			if(err){
				console.log(err);
				res.redirect("/admin");
			} else{
				var data ={
					userId:req.body.users.collegeId,
					password:req.body.password,
					id:newStd._id
				}
				Data.find({},function(err,databases){               //adding id for profs
					databases.forEach(function(database){
						database.students.push(data);
						database.save();
					}) 
				})
				var inputData={
					stdId:newStd._id,
				}
				if(isProf){
					Atd.create(inputData,function(err,newData){
						Prof.find({},function(err,profs){
							profs.forEach(function(prof){
								if(prof.totalClasses == 0){
									var d = {
										subject:prof.subject,
										attendance:[]
									}
									newData.data.push(d);
									
								}else{
									var attendances=[];
									prof.date.forEach(function(dt){
										var d={
											attendDate:dt,
											status:"ABSENT"
										}
										attendances.push(d);
									})
									var dat={
										subject:prof.subject,
										attendance:attendances,
										totalClasses:prof.totalClasses
									}
									newData.data.push(dat);
									// newData.save();
								}
							})
							newData.save();
						})
					})
					
					Marks.create(inputData,function(err,stdMarks){
						Prof.find({},function(err,prof){
							prof.forEach(function(prf){
								var d = {
									profId:prf._id
								}
								stdMarks.subjects.push(d);
							})
							stdMarks.save();
						})	
					})
				}
				else{
					console.log(isProf);
				}
			}
		})
		res.redirect("/admin/student/new");
	}
})


module.exports= router;