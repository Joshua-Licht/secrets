//jshint esversion:6

//Starting Code/ BoilerPlate Code
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

// Database Code
mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true, useUnifiedTopology: true
});

const userSchema = {
    email: String,
    password: String
};

const User = new mongoose.model("User", userSchema);

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
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({email: username},function(err, foundUser){
            if (err){
                console.log(err);
            }else{
                if(foundUser){
                    if (foundUser.password === password){
                        res.render("secrets");
                    }
                }
            }
        })
    });

app.route("/register")
    .get(function(req, res){
        res.render("register");
    })
    .post(function(req, res){
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });

        newUser.save(function(err){
            if (err){
                console.log(err);
            }else{
                res.render("secrets");
            }
        });
    });

// Server Connection Code
app.listen(3000, function() {
    console.log("Server started on port 3000");
});