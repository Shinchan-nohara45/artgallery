import express from 'express';
const router = express.Router();
import {
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
    getFavorites,
    addFavorite,
    removeFavorite,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; // For profile image uploads

router.route('/')
    .get(protect, admin, getUsers); // Admin can get all users

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('profileImage'), updateUserProfile); // User can update their profile, with optional image upload

router.route('/favorites')
    .get(protect, getFavorites);

router.route('/favorites/:id')
    .post(protect, addFavorite)
    .delete(protect, removeFavorite);

router.route('/:id')
    .delete(protect, admin, deleteUser) // Admin can delete any user
    .get(protect, admin, getUserById)    // Admin can get any user by ID
    .put(protect, admin, updateUser);    // Admin can update any user

export default router;