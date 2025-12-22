const bcrypt = require("bcryptjs");
const User = require("../models/User.js");
const { createAccessToken } = require("../middlewares/auth.js");

module.exports.register = async (req, res, next) => {
  try {
    const requiredFields  = [
        "fullName", 
        "email", 
        "password"
    ];
    const { 
        fullName, 
        email, 
        password, 
    } = req.body;

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).send({
            message: "All fields are required",
            missingFields,
        });
    }


    const existing = await User.findOne({ 
        email: String(email).toLowerCase().trim() 
    });

    if (existing) {
        return res.status(409).json({ 
            message: "Email already in use"
        });
    };

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
        fullName,
        email: String(email).toLowerCase().trim(),
        password: hashed,
    });

    return res.status(201).send({
        message: `Registration complete. Welcome, ${user.fullName}`,
        user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
        accessToken: createAccessToken(user),
    });
    } catch (err) {
        console.error("Registration Error:", err);
        return res.status(500).send({ 
            message: "Server error during registration" 
        });
    }
};

module.exports.login = async (req, res, next) => {
  try {
    const requiredFields = [
        "email",
        "password"
    ]
    const { 
        email, 
        password 
    } = req.body;

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).send({
            message: "All fields are required",
            missingFields,
        });
    }

    const user = await User.findOne({ 
        email: String(email).toLowerCase().trim() 
    }).select("+password");

    if (!user || user.isDeleted) {
        return res.status(401).send({ 
            message: "Invalid credentials" 
        });
    }

    if (user.isDisabled) {
        return res.status(403).send({ 
            message: "Account is disabled" 
        })
    };

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        return res.status(401).send({ 
            message: "Invalid credentials" 
        });
    }

    return res.status(200).send({
        message: `Login Successful`,
        user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
        accessToken: createAccessToken(user),
        });
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).send({ 
            message: "Server error during login" 
        });
    }
};
