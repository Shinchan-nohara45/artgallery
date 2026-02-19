import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import { uploadImageToCloudinary } from '../services/uploadService.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password'); // Exclude password

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            imageUrl: user.imageUrl,
            shippingAddress: user.shippingAddress,
            billingAddress: user.billingAddress,
            addresses: user.addresses,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        // If a new password is provided, hash it
        if (req.body.password) {
            user.password = req.body.password; // Mongoose pre-save hook will hash this
        }

        if (req.body.username) {
            const usernameExists = await User.findOne({ username: req.body.username });
            if (usernameExists && usernameExists._id.toString() !== user._id.toString()) {
                res.status(400);
                throw new Error('Username already taken');
            }
            user.username = req.body.username;
        }

        // Update addresses
        if (req.body.shippingAddress) {
            user.shippingAddress = req.body.shippingAddress;
        }
        if (req.body.billingAddress) {
            user.billingAddress = req.body.billingAddress;
        }

        // Add new address to the list
        if (req.body.newAddress) {
            user.addresses.push(req.body.newAddress);
            // If it's the first address or marked default, set as shipping/billing
            if (user.addresses.length === 1 || req.body.newAddress.isDefault) {
                user.shippingAddress = req.body.newAddress;
                user.billingAddress = req.body.newAddress;
            }
        }

        // Handle profile image upload if present
        if (req.file) {
            try {
                const result = await uploadImageToCloudinary(req.file.path, 'user_profiles');
                user.imageUrl = result.secure_url;
            } catch (error) {
                console.error('Cloudinary upload error:', error);
                res.status(500);
                throw new Error('Image upload failed');
            }
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            username: updatedUser.username,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            imageUrl: updatedUser.imageUrl,
            shippingAddress: updatedUser.shippingAddress,
            billingAddress: updatedUser.billingAddress,
            addresses: updatedUser.addresses,
            token: req.token, // Return the existing token, or re-issue if desired
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

import Notification from '../models/Notification.js';
import Artwork from '../models/Artwork.js'; // Need this for aggregation

// @desc    Get all users (Public - featured > 2 artworks OR search)
// @route   GET /api/users/public
// @access  Public
const getPublicUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { username: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

    // If searching, return all matching users (simple search)
    if (req.query.search) {
        const users = await User.find({ ...keyword }).select('_id name username imageUrl');
        res.json(users);
        return;
    }

    // Default: Featured Artists (uploaded > 2 artworks)
    // Find users who have uploaded more than 2 artworks
    // We can do this by aggregating Artworks grouped by artist
    
    const featuredArtists = await Artwork.aggregate([
        {
            $group: {
                _id: "$artist",
                count: { $sum: 1 }
            }
        },
        {
            $match: {
                count: { $gt: 2 }
            }
        }
    ]);

    const artistIds = featuredArtists.map(a => a._id);

    const users = await User.find({ _id: { $in: artistIds } })
        .select('_id name username imageUrl'); 
    
    res.json(users);
});

// @desc    Follow or Unfollow a user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = asyncHandler(async (req, res) => {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow || !currentUser) {
        res.status(404);
        throw new Error('User not found');
    }

    if (userToFollow._id.toString() === currentUser._id.toString()) {
        res.status(400);
        throw new Error('You cannot follow yourself');
    }

    // Check if already following
    const isFollowing = currentUser.following.some(id => id.toString() === userToFollow._id.toString());

    if (isFollowing) {
        // Unfollow
        currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollow._id.toString());
        userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUser._id.toString());
        
        await currentUser.save();
        await userToFollow.save();
        
        res.json({ message: 'Unfollowed user', isFollowing: false });
    } else {
        // Follow
        currentUser.following.push(userToFollow._id);
        userToFollow.followers.push(currentUser._id);
        
        await currentUser.save();
        await userToFollow.save();
        
        // Create Notification (only on follow)
        await Notification.create({
            recipient: userToFollow._id,
            sender: currentUser._id,
            type: 'follow'
        });

        res.json({ message: 'Followed user', isFollowing: true });
    }
});

// @desc    Get user followers
// @route   GET /api/users/:id/followers
// @access  Public
const getFollowers = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).populate('followers', 'name username imageUrl');
    if (user) {
        res.json(user.followers);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user following
// @route   GET /api/users/:id/following
// @access  Public
const getFollowing = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).populate('following', 'name username imageUrl');
    if (user) {
        res.json(user.following);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password'); // Exclude passwords
    res.json(users);
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.remove();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.isAdmin = req.body.isAdmin === true ? true : false; // Ensure it's a boolean

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('favorites');
    if (user) {
        res.json(user.favorites);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Add artwork to favorites
// @route   POST /api/users/favorites/:id
// @access  Private
const addFavorite = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const artworkId = req.params.id;

    if (user) {
        if (user.favorites.includes(artworkId)) {
            res.status(400);
            throw new Error('Artwork already in favorites');
        }

        user.favorites.push(artworkId);
        await user.save();
        res.json({ message: 'Added to favorites' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Remove artwork from favorites
// @route   DELETE /api/users/favorites/:id
// @access  Private
const removeFavorite = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const artworkId = req.params.id;

    if (user) {
        user.favorites = user.favorites.filter(
            (id) => id.toString() !== artworkId
        );
        await user.save();
        res.json({ message: 'Removed from favorites' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export {
    getUserProfile,
    updateUserProfile,
    getUsers,
    getPublicUsers,
    deleteUser,
    getUserById,
    updateUser,
    getFavorites,
    addFavorite,
    removeFavorite,
    followUser,
    getFollowers,
    getFollowing
};