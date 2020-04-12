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

/*
pool
.query(
    `
    SELECT
        username,
        messages.id AS id,
        time,
        content,
        sectionID
    FROM
        sections
    RIGHT JOIN
        messages ON sections.id = messages.sectionID
    WHERE
        sections.articleID = ?
    ;`,
    [articleID]
)
.then(([messages]) => {
    for(const message of messages){
        article.sections[sectionIndices[message.sectionID]].messages.push({
            username : message.username,
            id : message.id,
            time : message.time,
            content : message.content
        });
    }
    res.send({
        article
    })
})
*/

module.exports = router;