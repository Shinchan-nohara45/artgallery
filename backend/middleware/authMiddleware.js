import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Try to parse the full JSON string
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Alternatively, construct it from individual environment variables
    // Render often escapes newlines in env vars. This line ensures all permutations of \n decode to true newlines.
    const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
    const formattedKey = rawKey.replace(/\\n/g, '\n').replace(/"/g, '');
    
    serviceAccount = {
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: formattedKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };
  } else {
    // Fallback to local file
    serviceAccount = require("../serviceAccountKey.json");
  }
} catch (error) {
  console.error("Firebase Service Account Setup Error:", error.message);
  throw new Error("Missing Firebase Credentials! Set FIREBASE_SERVICE_ACCOUNT env var or provide individual FIREBASE_ variables or 'backend/serviceAccountKey.json'.");
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Protect routes (only logged-in users can access)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // First try JWT (for your own issued tokens)
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
      } catch {
        // If JWT fails, try Firebase
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = await User.findOne({ googleId: decodedToken.uid }).select("-password");
      }

      if (!req.user) {
        res.status(401);
        throw new Error("User not found");
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// Admin middleware
const adminOnly = (req, res, next) => {
  if (req.user?.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as an admin");
  }
};

// Artist middleware
const artistOnly = (req, res, next) => {
  if (req.user?.isArtist) {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as an artist");
  }
};

export { protect, adminOnly as admin, artistOnly as artist };
