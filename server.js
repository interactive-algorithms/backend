const express = require("express");
const app = express();

const router = require("./server/routers/main.js");

app.use(router);

var server = app.listen(process.env.PORT || 8000, function(){
	console.log("Server is listening on port " + server.address().port);
});
