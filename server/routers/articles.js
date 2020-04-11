const pool = require("server/db/main.js")
const express = require("express")
const router = express.Router();

router.get("/", (req, res) => {
    res.send("articles")
})

module.exports = router;