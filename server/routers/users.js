const bcrypt = require("bcrypt")
const pool = require("server/db/main.js")
const express = require("express")
const router = express.Router();
const {authorize, sendToken} = require("./middleware/auth")

const {saltRounds} = require("server/var")

const createUser = (req, res, next) => {
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
            ).then(([res]) => {
                req.userID = res.insertId;
                next();
            });
        });
    });
};

router.post("/signup", createUser, sendToken, (req, res) => {
    pool.query(
        `
        SELECT
            username, email, id
        FROM users
        WHERE id = ${req.userID}
        `
    ).then(([[user]]) => {
        res.status(200).send({user});
    })
})

const login = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const providedPassword = req.body.password;
    pool.query(
        `SELECT password, id FROM users WHERE username = ? OR email = ? LIMIT 1`,
        [username, email]
    ).then(([result]) => {
        if(result.length == 0){
            res.sendStatus(401);
        }else{
            bcrypt.compare(providedPassword, result[0].password, (err, bcryptResult) => {
                if(bcryptResult){
                    req.userID = result[0].id
                    next();
                }else{
                    res.sendStatus(401);
                }
            })
        }
    });
}

router.post("/login", login, sendToken, (req, res) => {
    pool.query(
        `
        SELECT
            username, email, id
        FROM users
        WHERE id = ${req.userID}
        `
    ).then(([[user]]) => {
        res.status(200).send({user});
    })
})

// TEST Authorization
router.get("/test", authorize, (req, res) => {
    res.status(200).send({
        username : req.username
    });
})

module.exports = router;