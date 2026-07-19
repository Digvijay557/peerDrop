const jwt = require("jsonwebtoken");

module.exports = function Auth(req, res, next) {

    console.log("Cookies:", req.cookies);

    try {

        const token = req.cookies.token;

        console.log("Token:", token);

        if (!token) {
            return res.status(401).json({
                message: "No token"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("Decoded:", decoded);

        req.user = decoded;

        next();

    } catch (err) {

        console.log(err);

        return res.status(401).json({
            message: err.message
        });

    }

};