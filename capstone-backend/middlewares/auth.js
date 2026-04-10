const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
require('dotenv').config();

const secret = `${process.env.ACCESS_TOKEN_SECRET}`;

module.exports.createAccessToken = (user) => {
    const data = {
        id: user._id,
        email: user.email,
        role: user.role
    };
    return jwt.sign(data, secret, {
       
    });
}

module.exports.verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Failed: No access token provided"
            });
        }

        jwt.verify(token, secret, async (err, decodedToken) => {
            if (err) {
                return res.status(403).json({
                    auth: "Failed",
                    message: err.message
                });
            }

            try {
                const user = await User.findById(decodedToken.id);

                if (!user) {
                    return res.status(404).json({
                        message: "User not found"
                    });
                }

                if (user.isDisabled) {
                    return res.status(403).json({
                        message: "Account is disabled. Please contact support."
                    });
                }

                // Use fresh user data from DB so role checks are always up-to-date.
                req.user = {
                    id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                };
                next();
            } catch (dbErr) {
                console.error('VerifyToken DB lookup error:', dbErr);
                return res.status(503).json({
                    message: 'Database is not ready. Please try again.'
                });
            }
        });

    } catch (err) {
        console.error("VerifyToken Error:", err);
        return res.status(500).json({
            message: "Server error during token verification"
        });
    }
};

module.exports.verifyAdmin = (req, res, next) => {
    if (!req.user || (req.user.role || '').toLowerCase() !== 'admin') {
        return res.status(403).json({
            message: "Access denied: Admins only"
        });
    }
    next();
};

module.exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).send({
                message: "Access denied: Insufficient privileges"
            });
        }
        next();
    };
};
