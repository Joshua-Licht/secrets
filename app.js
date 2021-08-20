//jshint esversion:6

//Starting Code/ BoilerPlate Code
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');  
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");

// Auth lvl 6 (OAuth) ---------------------------------------------- Start of section
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
// Auth lvl 6 (OAuth) ---------------------------------------------- end of section

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Database Code
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true, useUnifiedTopology: true
});

mongoose.set('useCreateIndex', true) 

const userSchema = new mongoose.Schema({                
    email: String,
    password: String,
    googleId: String
});            

userSchema.plugin(passportLocalMongoose); 
// Auth lvl 6 (OAuth) ---------------------------------------------- Start of section
userSchema.plugin(findOrCreate); 
// Auth lvl 6 (OAuth) ---------------------------------------------- End of section

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// Auth lvl 6 (OAuth) ---------------------------------------------- Start of Updated section
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});
// Auth lvl 6 (OAuth) ---------------------------------------------- end of Updatedsection

// Auth lvl 6 (OAuth) ---------------------------------------------- End of section
//  ---------------------------------------------- (google OAuth) Start
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
//  ---------------------------------------------- (google OAuth)  End
// Auth lvl 6 (OAuth) ---------------------------------------------- End of section

// standard code
app.route("/")
    .get(function(req, res) {
        res.render("home");
    });

// Auth lvl 6 (OAuth) ---------------------------------------------- End of section
//  ---------------------------------------------- (google OAuth) Start
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets", 
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/secrets")
});
//  ---------------------------------------------- (google OAuth)  End
// Auth lvl 6 (OAuth) ---------------------------------------------- End of section


app.route("/login")
    .get(function(req, res) {
        res.render("login");  
    })
    .post(function(req, res){
        const user = new User({
            username: req.body.username,
            password: req.body.password
        })

        req.logIn(user, function(err){
            if(err){
                console.log(err);
            }else{
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/secrets")
                });
            }
        })
    });

app.route("/logout")
    .get(function(req, res) {
        req.logOut();
        res.redirect("/");
    });

app.route("/register")
    .get(function(req, res){
        res.render("register");
    })
    .post(function(req, res){

        User.register({username: req.body.username}, req.body.password, function(err, user) {
            if(err){
                console.log(err);
                res.redirect("/register");
            }else{
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/secrets")
                });
            }
        });
    });

app.route("/secrets")
    .get(function(req, res) {
        if(req.isAuthenticated()){
            res.render("secrets"); 
        }else{
            res.redirect("/login");
        } 
    });

// Server Connection Code
app.listen(3000, function() {
  console.log("Server started on port 3000");
});