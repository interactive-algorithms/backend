const express = require("express");
const connection = require("server/db/main.js")
const app = express.Router();

app.get("/", function(req, res) {
	res.send("hello");
});


//404 page
//keep at bottom
app.use(function (req, res, next) {
	res.status(404).send("<b>404</b> Sorry can't find that!");
});

module.exports = app;
