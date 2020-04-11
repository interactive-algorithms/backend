const jwt = require("jsonwebtoken");

const authorize = (req, res, next) => {
    const token = req.cookies.TOKEN;
    if(!token) {
        res.sendStatus(401);
    } else {
        jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {            
            if (err.name == "TokenExpiredError"){
                res.status(401).send("token expired");
            }else if(err){
                throw err;
            }

            if (data) {
                req.username = data.username;
                next();
            }
        });
    }
};

const sendToken = (req, res, next) => {
    jwt.sign({
        username : req.body.username 
    }, process.env.TOKEN_SECRET, {
        expiresIn: 60
    }, (err, token) => {
        if(err){
            res.sendStatus(500);
        }else{
            res.cookie(
                "TOKEN", token,
                {maxAge : 60, httpOnly : true}
            );
            next();
        }
    })
}

module.exports = {
    authorize,
    sendToken
};