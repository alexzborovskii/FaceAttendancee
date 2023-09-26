const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.headers["x-access-token"];
    //notoken
    if (!token) return res.status(401).json({ msg: "not authorized" });

    //verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
        if (err) {
            console.log(err)
            return res.status(403).json({ msg: "verify token failed" });
        }
        req.user = decode;
        // console.log(req)
        next();
    });
};

module.exports = { verifyToken };
