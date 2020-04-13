const jwt = require("jsonwebtoken");

const authorize = (req, res, next) => {
    const token = req.cookies.TOKEN;
    if(!token) {
        res.sendStatus(401);
    } else {
        jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {            
            if (err && err.name == "TokenExpiredError"){
                res.status(401).send("token expired");
            }else if(err){
                throw err;
            }else if (data) {
                req.username = data.username;
                sendToken(req, res, next);
            }
        });
    }
};

const sendToken = (req, res, next) => {
    jwt.sign({
        username : (req.body && req.body.username ? req.body.username : req.username)
    }, process.env.TOKEN_SECRET, {
        expiresIn: 60
    }, (err, token) => {
        if(err){
            res.sendStatus(500);
        }else{
            res.cookie(
                "TOKEN", token,
                {maxAge : 60000, httpOnly : true}
            );
            next();
        }
    })
}

module.exports = {
    authorize,
    sendToken
};