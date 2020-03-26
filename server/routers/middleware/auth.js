const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const token = req.header("Authorization");
    if(!token) {
        res.sendStatus(401);
    } else {
        jwt.verify(token, process.env.TOKEN_SECRET, (err, verified) => {
            if (err) throw err;
            if (verified) {
                req.userID = verified;
                next();
            } else {
                res.sendStatus(401);
            }
        });
    }
};

module.exports = auth;