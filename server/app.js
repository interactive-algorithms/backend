const express = require("express");
const http = require("http");
const cors = require('cors');
const app = express();
const expressCookieParser = require('cookie-parser')

require("dotenv").config();

const router = require("./routers/main.js");

require("./db/main"); // init db

app.use(express.json());
app.use(cors({
  credentials: true,
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(expressCookieParser())

app.use(router);

const server = http.createServer(app);
const io = require('socket.io')(server);

require('./routers/messages')(io); // realtime chats in each article section

server.listen(process.env.PORT || 8000, function(){
	console.log("Server is listening on port " + server.address().port);
});

