const pool = require("server/db/main.js");
const express = require("express");
const router = express.Router();
const {authorize} = require("./middleware/auth")

router.post("/:sectionID", authorize, (req, res) => {
    const sectionID = req.params.sectionID;
    const message = req.body.message;
    const username = req.username;
    pool
    .query(
        "INSERT INTO messages (content, username, sectionID) VALUES (?, ?, ?)",
        [message, username, sectionID]
    )
    .then(([messageQueryResult]) => {
        pool
        .query(`SELECT * FROM messages WHERE id = ${messageQueryResult.insertId}`)
        .then(([[message]]) => {
            res.send(message);
        })
    })
})

module.exports = router;