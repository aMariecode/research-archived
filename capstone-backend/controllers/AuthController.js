// Placeholder for password reset request
module.exports.requestPasswordReset = async (req, res) => {
    // TODO: Implement password reset logic
    return res.status(501).json({ message: "Password reset request not implemented yet." });
};

// Placeholder for password reset
module.exports.resetPassword = async (req, res) => {
    // TODO: Implement password reset logic
    return res.status(501).json({ message: "Password reset not implemented yet." });
};
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

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await User.findOne({ 
        email: normalizedEmail
    });

    if (existing) {
        return res.status(409).json({ 
            message: "Email already registered. Please try logging in or use a different email."
        });
    };

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
        fullName,
        email: normalizedEmail,
        password: hashed,
    });

    console.log(`New student user registered: ${user.email}`);

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

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({ 
        email: normalizedEmail
    }).select("+password");

    console.log('Login attempt for:', normalizedEmail);
    console.log('Found user?', !!user);
    if (user) console.log('user flags: isDeleted=', user.isDeleted, 'isDisabled=', user.isDisabled, 'passwordHashExists=', !!user.password);

    if (!user || user.isDeleted) {
        return res.status(401).send({ 
            message: "Invalid credentials" 
        });
    }

    if (user.isDisabled) {
        return res.status(403).send({ 
            message: "Account is disabled. Please contact support." 
        })
    };

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log('password compare result:', isPasswordCorrect);
    if (!isPasswordCorrect) {
        return res.status(401).send({ 
            message: "Invalid credentials" 
        });
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save();
    
    console.log(`Successful login: ${user.email}`);
    
    return res.status(200).send({
        message: `Login Successful`,
        user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, lastLogin: user.lastLogin },
        accessToken: createAccessToken(user),
    });
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).send({ 
            message: "Server error during login" 
        });
    }
};
