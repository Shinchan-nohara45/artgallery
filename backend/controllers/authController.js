import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import asyncHandler from 'express-async-handler';
// import { sendVerificationEmail } from '../services/emailService.js';
import bcrypt from 'bcryptjs';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, username } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Check username uniqueness if provided
    if (username) {
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            res.status(400);
            throw new Error('Username already taken');
        }
    }

    const user = await User.create({
        name,
        email,
        password, // Password will be hashed by the pre-save hook in User model
        username,
        isArtist: true, // Allow new users to upload by default
    });

    if (user) {
        // Optionally send a verification email
        // await sendVerificationEmail(user.email, user.name, user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
    const { name, email, googleId, imageUrl } = req.body;

    let user = await User.findOne({ email });

    if (user) {
        // If user exists, just log them in
        let updated = false;
        if (!user.googleId) {
            user.googleId = googleId;
            updated = true;
        }
        // Ensure existing users are artists (fix for upload authorization)
        if (!user.isArtist) {
            user.isArtist = true;
            updated = true;
        }
        
        if (updated) {
            await user.save();
        }
        res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
            imageUrl: user.imageUrl || imageUrl,
        });
    } else {
        // Create new user
        const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(generatedPassword, salt);
        
        // Generate a base username from email or name
        let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        // Ensure uniqueness (simple approach: append random string if conflicts, but here just random suffix to be safe)
        const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
        const generatedUsername = `${baseUsername}${uniqueSuffix}`;

        user = await User.create({
            name,
            email,
            googleId,
            password: hashedPassword, // A strong generated password
            imageUrl,
            username: generatedUsername,
            isArtist: true, // Make Google users artists by default for now
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
                imageUrl: user.imageUrl,
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data for Google signup');
        }
    }
});


// @desc    Logout user (clear token - not strictly needed for JWT, but good practice)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
    // For JWT, logout is often handled client-side by removing the token.
    // If using cookie-based tokens, you might clear the cookie here.
    res.status(200).json({ message: 'User logged out' });
});


export { registerUser, loginUser, googleAuth, logoutUser };