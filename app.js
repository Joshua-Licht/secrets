//jshint esversion:6

//Starting Code/ BoilerPlate Code
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');  

// Auth lvl 5 (cookies & Sessions) ---------------------------------------------- Start of section
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");
const { Passport } = require('passport');
// Auth lvl 5 (cookies & Sessions) ---------------------------------------------- end of section

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

// Auth lvl 5 (cookies & Sessions) ---------------------------------------------- Start of section
app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
// Auth lvl 5 (cookies & Sessions) ---------------------------------------------- end of section

// Database Code
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true, useUnifiedTopology: true
});

mongoose.set('useCreateIndex', true) //---------------------------------------- DeprecationWarning fix

const userSchema = new mongoose.Schema({                
    email: String,
    password: String
});            

userSchema.plugin(passportLocalMongoose); //------------------------------------ Auth lvl 5 (cookies & Sessions)

const User = new mongoose.model("User", userSchema);

// Auth lvl 5 (cookies & Sessions) ---------------------------------------------- Start of section 
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Auth lvl 5 (cookies & Sessions) ---------------------------------------------- end of section 

// standard code
app.route("/")
    .get(function(req, res) {
        res.render("home");
    });

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