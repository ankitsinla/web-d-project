var express = require("express");
var router = express.Router();
var passport = require("passport");
var User     =require("../models/user");
var Student  =require("../models/std");
var Prof     =require("../models/prof");
var Atd     =require("../models/attend");
var Data    =require("../models/database");
var flash 	=require("connect-flash");
var Admin    =require("../models/admin");


const upload = require("../middleware/upload");
const path = require('path');


router.get("/",function(req,res){
	res.render('../views/home');
	// res.render("home");
})

//LOGIN RUTES
router.get("/login/:usertype",function(req,res){
 	res.render("login",{user:req.params.usertype});	
 });

router.post("/login/:usertype", passport.authenticate("local",{
	failureRedirect:"/"
}) ,function(req,res){
	if(req.params.usertype == "student"){
		res.redirect("/std/check")
	}
	else if(req.params.usertype == "professor"){
		res.redirect("/prof/check")
	}
	else{
		res.redirect("/admin/check")
	}	
});

router.get("/editProfile",isLoggedIn,function(req,res){
	Student.findOne({id:req.user._id},function(err,std){
		console.log("std:"+std);
		if(std == null){
			Prof.findOne({id:req.user._id},function(err,prof){
				res.redirect("/prof/"+prof._id+"/edit");
			})
				
		}else{
			res.redirect("/std/"+std._id+"/edit");
		}
		}
	)
})

router.get("/logout",function(req,res){
	req.logout();
	req.flash('success',"Successfully Logged Out");
	res.redirect("/");
})
	

//AUTH ROUTE

router.get("/registernew",function(req,res){
	res.render("../views/firstLogin");
});

router.post("/registernew",function(req,res){
	 var flag = 0;
	// var id="";
	Data.find({},function(err,data){
		data.forEach(function(dt){
			if(req.body.usertype=="Student"){
				dt.students.forEach(function(student){
					if(student.userId == req.body.username && student.password == req.body.password && student.isRegister=="false"){
						flag =1;
						id = student.id;
					}
				})
			}else{
				dt.professors.forEach(function(professor){
					if(professor.userId == req.body.username && professor.password == req.body.password && professor.isRegister=="false") {
						flag=1;
						id = professor.id;
					}
				})
			}
			if(flag == 0){
				req.flash("error","Enter valid Credientials !!");
				res.redirect("/registernew");
			}else{
				req.flash("success","Enter new Credientials !!");
				res.redirect("/register/"+req.body.usertype+"/"+id)
			}
		})
	})
			
})

router.get("/register/:usertype/:id",function(req,res){
	res.render("signup",{user:req.params.usertype,id:req.params.id});
});

// router.get("/register/admin",function(req,res){
// 	res.render("signup");
// });

router.post("/register/:usertype/:id",function(req,res){
	var newUser=new User({username: req.body.username});
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			console.log(err);
			return res.redirect("/register");
		}else{
			passport.authenticate("local")(req,res,function(){
				if(req.params.usertype=="Student"){
					Student.find({},function(err,students){
						students.forEach(function(student){
							Data.find({},function(err,datas){
								datas.forEach(function(data){
									data.students.forEach(function(newstd){
										if(newstd.id.equals(req.params.id)){
											newstd.isRegister="true";
											data.save();
										}
									})
								})
							})
						if(student._id.equals(req.params.id)){
								student.id=user._id;
								student.save();
								req.flash("success","Successfully Signed Up!!");
								res.redirect("/std/profile");
							}		
							
						})
					})
				}else if(req.params.usertype=="Professor"){
					Prof.find({},function(err,profs){
						profs.forEach(function(prof){
							Data.find({},function(err,datas){
								datas.forEach(function(data){
									data.professors.forEach(function(newprof){
										if(newprof.id.equals(req.params.id)){
											newprof.isRegister="true";
											data.save();
										}
									})
								})	
							})
							if(prof._id.equals(req.params.id)){
								prof.id=user._id;
								prof.save();
								req.flash("success","Successfully Signed Up!!");
								res.redirect("/prof/profile");
							}	
						})
					})
				}
				// res.redirect("/admin/profile/edit")
			})
		}
		
	})
})


function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		req.flash("error","Please login first!!");
		res.redirect("/");
	}
}

module.exports= router;