const express = require("express");
const app = express();

require("dotenv").config();

const router = require("server/routers/main.js");

require("server/db/main"); // init db

app.use(router);

const server = app.listen(process.env.PORT || 8000, function(){
	console.log("Server is listening on port " + server.address().port);
});

