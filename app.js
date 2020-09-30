var express 	= require("express"),
	mongoose	= require("mongoose"),
	passport    = require("passport"),
	bodyParser	= require("body-parser"),
	User 		= require("./models/user"), 
	localStrategy=require("passport-local"),
	methodOverride=require("method-override"),
	flash         =require("connect-flash"),
	passportLocalMongoose=require("passport-local-mongoose");
	
// var jsdom = require('jsdom');
// const { JSDOM } = jsdom;
// const { window } = new JSDOM();
// const { document } = (new JSDOM('')).window;
// global.document = document;

// var $ = jQuery = require('jquery')(window);


var userRoutes = require("./routes/std"),
	authRoutes = require("./routes/auth"),
	adminRoutes= require("./routes/adm"),
	profRoutes = require("./routes/prof");

 var app = express();  

mongoose.connect('mongodb://localhost:27017/mbmapp', {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(flash());

//passport configuration
app.use(require("express-session")({
	secret:"I am Ankit",
	resave: false,
	saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});


app.use(authRoutes);
app.use(userRoutes);
app.use(profRoutes);
app.use(adminRoutes);


app.listen(process.env.PORT || 3000,process.env.IP,function(req,res){
	console.log("project started!!!");
})