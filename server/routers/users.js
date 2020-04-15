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
    const user = req.body.user;
    const providedPassword = req.body.password;
    pool.query(
        `SELECT password, id, username FROM users WHERE username = ? OR email = ? LIMIT 1`,
        [user, user]
    ).then(([result]) => {
        if(result.length == 0){
            res.sendStatus(401);
        }else{
            bcrypt.compare(providedPassword, result[0].password, (err, bcryptResult) => {
                if(bcryptResult){
                    req.userID = result[0].id;
                    req.username = result[0].username;
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

router.get("/user", authorize, (req, res) => {
    pool.query(
        `
        SELECT
            username, email, id
        FROM users
        WHERE username = ?
        `,
        [req.username]
    ).then(([[user]]) => {
        res.status(200).send({user});
    })
})

/*router.patch("/user", authorize, (req, res) => {
    pool.query(
        `SELECT password, id, username FROM users WHERE username = ? LIMIT 1`,
        [req.username]
    ).then(([[user]]) => {
        const username = !req.body.username || req.body.username == "" ? user.username : req.body.username;
        const email = !req.body.email || req.body.email == "" ? user.email : req.body.email;
        const password = !req.body.password || req.body.password == "" ? user.password : req.body.password;
        pool.query(
            `SELECT password, id, username FROM users WHERE username = ? OR email = ? LIMIT 1`,
            [username, email]
        ).then(([userSelectResult]) => {
            if(userSelectResult.length > 0 && userSelectResult[0].username != req.username){
                res.sendStatus(400);
            }else{
                pool.query(
                    `
                    UPDATE
                        username = ?, email = ?, password = ?
                    FROM users
                    WHERE id = ${req.userID}
                    `,
                    [username || userSelectResult[0].username, email || userSelectResult[0].email || password || userSelectResult[0].password]
                ).then(([[user]]) => {
                    res.status(200).send({user});
                })
            }
        })
    })
})*/

router.post("/logout", (req, res) => {
    res.cookie(
        "TOKEN", null,
        {maxAge : 0, httpOnly : true}
    );
    res.sendStatus(200);
})

// TEST Authorization
router.get("/test", authorize, (req, res) => {
    res.status(200).send({
        username : req.username
    });
})

module.exports = router;