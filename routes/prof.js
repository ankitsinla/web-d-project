var express = require("express");
var router = express.Router();
var Prof=require("../models/prof");
var User =require("../models/user");
var Std =require("../models/std");
var Atd =require("../models/attend");
var Marks =require("../models/marks");
const upload = require("../middleware/upload");
const multer = require('multer');
const path = require('path');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
var mongoose = require("mongoose");

const mongoURI = 'mongodb://localhost:27017/mbmapp';

// Init gfs
let gfs;

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);


conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);  
  gfs.collection('uploads');
});

router.get("/prof/check",function(req,res){
	//console.log(req.user);
	Prof.findOne({id:req.user._id},function(err,professor){
		if(professor == undefined){
			req.logout();
			res.redirect("/login/professor")
		}else{
			res.redirect("/prof/profile");
		}
	})
})

router.get("/prof/:id/assignments",function(req,res){
	gfs.files.find().toArray((err, files) => {
		//console.log(files);
		Prof.findById(req.params.id,function(err,prof){
			// Check if files
			if (!files || files.length === 0) {
			  res.render('../views/professor/assignments', { files: false,prof:prof});
			} else {
			  res.render('../views/professor/assignments', { files: files,prof:prof });
			}
		})
  });
})

router.post('/prof/:id/assignment/upload', upload.single('file'), (req, res) => {
	//console.log(req.file);
	Prof.findById(req.params.id,function(err,prof){
		var a = {
			topic : req.file.originalname,
			id:req.file.id
		}
		prof.assignments.push(a);
		prof.save();
		res.redirect ('/prof/'+prof._id+'/assignments');
	})
  	
});

router.get('/prof/:id/files/:filename', (req, res) => {
  gfs.files.findOne({filename: req.params.filename}, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // If File exists this will get executed
    const readstream = gfs.createReadStream(file.filename);
    return readstream.pipe(res);
  });
});


router.delete('/prof/:profid/assignment/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
	  if (err) {
      return res.status(404).json({ err: err });
    }
	  
	  Prof.findById(req.params.profid,function(err,prof){
		   //prof.assignments.forEach(function(assignments){
		  // if(assignment.id == req.params.id){
		  console.log(prof.assignments)
		  var index =0;
		  prof.assignments.forEach(function(assignment){
			  console.log(index)
			  if(assignment.id == req.params.id){
				  prof.assignments.splice(index,1);
				  console.log("index-"+index);
			  }
			  index+=1;
		  })
		  console.log(prof.assignments);
		  res.redirect ('/prof/'+prof._id+'/assignments');
	  })
  });
});



router.get("/prof/profile",isLoggedIn,function(req,res){
	Prof.findOne({id:req.user._id},function(err,prof){
		if(err){
			console.log(err);
			res.send("Error occured");
		}else{
			res.render("../views/professor/profProfile",{prof:prof});
		}
	})
})

router.get("/prof/profile/edit",function(req,res){
	res.render("../views/professor/editProfile")
})


router.post("/prof/profile/edit",function(req,res){
			Prof.create(req.body.prof,function(err,newUser){
				if(err){
					console.log(err);
					res.redirect("/prof/profile/edit");
				} else{
					newUser.id=req.user._id;
					newUser.save();
					res.render("../views/professor/profProfile.ejs",{prof:newUser});
					Atd.find({},function(err,students){
						students.forEach(function(student){
							var d = {
								subject:newUser.subject,
								attendance:[]
							}
							student.data.push(d);
							student.save();
						})
					})
					Marks.find({},function(err,marksheets){
						marksheets.forEach(function(marksheet){
							var d = {
								profId:newUser._id
							}
							marksheet.subjects.push(d);
						})
					})

				}
			})
	
});


router.get("/prof/:id/atend",function(req,res){
	Std.find({},function(err,students){
		if(err){
			console.log(err);
		} else{
			var datetoday=curday('-');
			Prof.findById(req.params.id,function(err,prof){
				if(prof.date.indexOf(datetoday)==-1){
					res.render("../views/professor/attendence",{students:students,profId:req.params.id,date:datetoday});
				}else{
					res.redirect("/prof/profile");
				}
			})
			
		}
	})
})

router.post("/prof/:id/attend",function(req,res){
	//var datetoday=req.body.date;
	var profattend=0;
	var sub="";
	var classdate=curday('-').toString();
	Prof.findById(req.params.id,function(err,p){
		if(err){
			console.log(err)
		}else{
			profattend= p.totalClasses+1;
			p.totalClasses= profattend;
			p.date.push(classdate);
			p.save();
			sub=p.subject;
		}
	})
	
	var arr=[];
	Atd.find({},function(err,stdData){
		if(err){
			console.log(err)
		}else{
			stdData.forEach(function(stddata){
				stddata.data.forEach(function(atendata){
					if(atendata.subject == sub){
						//console.log(req.body.user);
					//atendata.findOne({subject:},function(err,std){
						if(req.body.user == undefined){
							var d = {
								attendDate:classdate,
								status:"ABSENT"
							};
							atendata.attendance.push(d);
						}else{
							var k=Object.keys(req.body.user);
							var obj=req.body.user;
							var flag=0;
							k.forEach(function(ks){
								if(ks == stddata.stdId){
									var d = {
										attendDate:classdate,
										status:"PRESENT"
									};
									atendata.attendance.push(d);
									atendata.classAttended = atendata.classAttended + 1;
									flag=1;
								}
							})
							if(flag == 0){
								var d = {
									attendDate:classdate,
									status:"ABSENT"
								};
								atendata.attendance.push(d);
							}
						}
						atendata.totalClasses = atendata.totalClasses +1;
						return;
					}
				})
				stddata.save();
			})
		}
	
	})
	res.redirect("/prof/profile");
})

router.get("/prof/:id/atend/classdate",function(req,res){
	Prof.findById(req.params.id,function(err,prof){
		res.render("../views/professor/classDate",{prof:prof});	
	})
})

router.get("/prof/:id/atend/show/:dt",function(req,res){
	//console.log(req.params.dt);
	Atd.find({},function(err,attending){
		if(err){
			console.log(err)
		}else{
			Std.find({},function(err,students){
				if(err){
					console.log(err)
				}else{
					Prof.findById(req.params.id,function(err,prof){
				res.render("../views/professor/showAttendance",{attend:attending,students:students,prof:prof,dt:req.params.dt});	
						//res.send("done!!")
					})
				}
			})
		}
	})
})


// router.get("/prof/:id/fmarks",function(req,res){
// 		res.render("../views/professor/selectTerm",{profId:req.params.id})
// })


router.get("/prof/:id/feedmarks",function(req,res){
	Std.find({},function(err,students){
		Marks.find({},function(err,marks){
			Prof.findById(req.params.id,function(err,prof){
				res.render("../views/professor/feedMarks",{students:students,prof:prof,marks:marks})
			})
			
		})	
	})
})

router.post("/prof/:id/feedmarks",function(req,res){
	var keis=[];
	var marksheet={};
	var term;
	Prof.findById(req.params.id,function(err,prof){
		term=prof.activeMarksFeed;
		if(prof.activeMarksFeed == "fterm"){
			prof.isMarks="true";
			keis=Object.keys(req.body.first);
			marksheet=req.body.first;
		}
		else if(prof.activeMarksFeed == "sterm"){
			prof.isMarks="true";
			keis=Object.keys(req.body.second);
			marksheet=req.body.second;
		}
		else if(prof.activeMarksFeed == "internal"){
			prof.isMarks="true";
			keis=Object.keys(req.body.internal);
			marksheet=req.body.internal;
		}
		else if(prof.activeMarksFeed == "sem"){
			prof.isMarks="true";
			keis=Object.keys(req.body.sem);
			marksheet=req.body.sem;
		}
		prof.save();
		
	})
	
	Marks.find({},function(err,marks){
		marks.forEach(function(mark){
			keis.forEach(function(ke){
				if(ke == mark.stdId){
					mark.subjects.forEach(function(subject){
						if(subject.profId.equals(req.params.id)){
							//console.log(term)
							if(term == 'fterm'){
								subject.fterm={
									marks:marksheet[ke],
									feed:true
								}
							}
							else if(term == 'sterm'){
								subject.sterm={
									marks:marksheet[ke],
									feed:true
								}
							}
							else if(term == 'internal'){
								subject.internal={
									marks:marksheet[ke],
									feed:true
								}
							}
							else if(term == 'sem'){
								subject.sem={
									marks:marksheet[ke],
									feed:true
								}
							}
							var total=0;
							var n=0;
							if(subject.fterm.feed=="true"){
								total +=subject.fterm.marks;
								n+=1;
							}
							if(subject.sterm.feed=="true"){
								total +=subject.sterm.marks;
								n+=1;
							}
							if(subject.internal.feed=="true"){
								total +=subject.internal.marks;
								n+=1;
							}
							if(subject.sem.feed=="true"){
								total +=subject.sem.marks;
								n+=1;
							}
							subject.total=total/n;
							//console.log(marksheet.ke)
							
						}
					})
				}
			})
			mark.save();
			//console.log(mark);
			
		})
	})
	res.redirect("/prof/profile");
})

		   
router.get("/prof/:id/smarks",function(req,res){
	Std.find({},function(err,students){
		Marks.find({},function(err,marksheet){
				Prof.findById(req.params.id,function(err,prof){
					res.render("../views/professor/showMarks",{prof:prof,students:students,marksheet:marksheet})
				})
		})
	})
})
	   
router.get("/std/:id/assignments/prof",function(req,res){
	gfs.files.find().toArray((err, files) => {
		Prof.find({},function(err,profs){
			// Check if files
			if (!files || files.length === 0) {
			  res.render('../views/student/assignments', { files: false,profs:profs,stdId:req.params.id});
			} else {
			  res.render('../views/student/assignments', { files: files,profs:profs ,stdId:req.params.id});
			}
		})
  	})
})


router.get("/admin/profinfo/:id",function(req,res){
	gfs.files.find().toArray((err, files) => {
		Prof.findById(req.params.id,function(err,prof){
			// Check if files
			if (!files || files.length === 0) {
			  res.render('../views/admin/profinfo', { files: false,prof:prof});
			} else {
			  res.render('../views/admin/profinfo', { files: files,prof:prof});
			}
		})
  	})
})


var curday = function(sp){
	today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //As January is 0.
	var yyyy = today.getFullYear();

	if(dd<10) dd='0'+dd;
	if(mm<10) mm='0'+mm;
	return (dd+sp+mm+sp+yyyy);
};

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		res.redirect("/");
	}
}

module.exports= router;