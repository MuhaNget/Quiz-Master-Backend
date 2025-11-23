const jwt = require("jsonwebtoken");
module.exports = function generateToken(id) {
    const secret = process.env.JWT_SECRET || "secret";
    const expires = process.env.JWT_EXPIRES_IN || "365d";
    return jwt.sign({ id }, secret, { expiresIn: expires });
};
