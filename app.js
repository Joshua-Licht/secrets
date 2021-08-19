//jshint esversion:6

//Starting Code/ BoilerPlate Code
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));


// Server Connection Code
app.listen(3000, function() {
  console.log("Server started on port 3000");
});