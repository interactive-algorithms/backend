const express = require("express");
const cors = require('cors')
const app = express();
const cookieParser = require('cookie-parser')

require("dotenv").config();

const router = require("./routers/main.js");

require("./db/main"); // init db

app.use(express.json());
//app.use(cors());
app.use(cookieParser())

app.use(router);

const server = app.listen(process.env.PORT || 8000, function(){
	console.log("Server is listening on port " + server.address().port);
});

