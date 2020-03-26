const bcrypt = require("bcrypt")
const pool = require("server/db/main.js")
const express = require("express")
const router = express.Router();
const auth = require("./middleware/auth")

const saltRounds = 12;

router.post("/signup", async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    pool.query(
        `SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1`,
        [username, email]
    ).then(([existingUsers]) => {
        if(existingUsers.length > 0){
            res.status(409).send({error : "user already exists"});
            return;
        }
        bcrypt.hash(password, saltRounds, (err, hash) => {
            pool.query(
                `INSERT INTO users (username, email, password) VALUES (?,?,?)`,
                [username, email, hash]
            ).then(() => {
                res.status(200).send({message : "user created"});
            });
        });
    });
})

router.get("/hej", auth, (req, res) => {
    
})

module.exports = router;