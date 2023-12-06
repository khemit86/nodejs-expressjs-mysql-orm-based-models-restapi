const express = require("express");
const bodyParser = require("body-parser");
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');

var routes = require("./app/routes/api.js");

const app = express();

// parse requests of content-type: application/json
app.use(bodyParser.json());

// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// for parsing multipart/form-data
app.use(fileUpload());

const db = require("./app/models");
//db.sequelize.sync({force: false});

app.get('/', function(req,res){
	return res.json({
    	"status_code":422,
    	"message":"Url Not Correct",
    });
});

app.use('/api', routes); 

//The 404 Route (ALWAYS Keep this as the last route)
app.all('*', function(req, res){
	return res.json({
		"status_code":404,
		"message":"Url Not Found",
	});
});

// set port, listen for requests
app.listen(3000, () => {
	console.log("Server is running on port 3000.");
});