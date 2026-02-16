import asyncHandler from "express-async-handler";
import fs from "fs";
import Artwork from "../models/Artwork.js";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../services/uploadService.js";

// @desc    Fetch all artworks
// @route   GET /api/artworks
// @access  Public
const getArtworks = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        title: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  const count = await Artwork.countDocuments({ ...keyword });
  const artworks = await Artwork.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .populate("artist", "name email"); //joins 

  res.json({ artworks, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single artwork
// @route   GET /api/artworks/:id
// @access  Public
const getArtworkById = asyncHandler(async (req, res) => {
  const artwork = await Artwork.findById(req.params.id).populate(
    "artist",
    "name email"
  );

  if (artwork) {
    res.json(artwork);
  } else {
    res.status(404);
    throw new Error("Artwork not found");
  }
});

// @desc    Create an artwork
// @route   POST /api/artworks
// @access  Private/Artist
const createArtwork = asyncHandler(async (req, res) => {
  const { title, description, category, price, stock } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error("Artwork image is required.");
  }

  // Upload to Cloudinary
  let cloudinaryResult;
  try {
    cloudinaryResult = await uploadImageToCloudinary(req.file.path, "artworks");
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500);
    throw new Error("Failed to upload artwork image.");
  } finally {
        // Clean up local file
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error deleting local file:", err);
            });
        }
  }

  const artwork = new Artwork({
    title,
    artist: req.user._id,
    description,
    category,
    price,
    stock,
    imageUrl: cloudinaryResult.secure_url,
    cloudinaryId: cloudinaryResult.public_id,
  });

  const createdArtwork = await artwork.save();
  res.status(201).json(createdArtwork);
});

// @desc    Update an artwork
// @route   PUT /api/artworks/:id
// @access  Private/Artist/Admin
const updateArtwork = asyncHandler(async (req, res) => {
  const { title, description, category, price, stock } = req.body;

  const artwork = await Artwork.findById(req.params.id);

  if (!artwork) {
    res.status(404);
    throw new Error("Artwork not found");
  }

  // Ensure user owns this artwork or is admin
  if (
    artwork.artist.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(403);
    throw new Error("Not authorized to update this artwork");
  }

  // Update fields
  artwork.title = title || artwork.title;
  artwork.description = description || artwork.description;
  artwork.category = category || artwork.category;
  artwork.price = price || artwork.price;
  artwork.stock = stock || artwork.stock;

  // If new image uploaded
  if (req.file) {
    if (artwork.cloudinaryId) {
      await deleteImageFromCloudinary(artwork.cloudinaryId);
    }
    const cloudinaryResult = await uploadImageToCloudinary(
      req.file.path,
      "artworks"
    );
    artwork.imageUrl = cloudinaryResult.secure_url;
    artwork.cloudinaryId = cloudinaryResult.public_id;
  }

  const updatedArtwork = await artwork.save();
  res.json(updatedArtwork);
});

// @desc    Delete an artwork
// @route   DELETE /api/artworks/:id
// @access  Private/Artist/Admin
const deleteArtwork = asyncHandler(async (req, res) => {
  const artwork = await Artwork.findById(req.params.id);

  if (!artwork) {
    res.status(404);
    throw new Error("Artwork not found");
  }

  if (
    artwork.artist.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this artwork");
  }

  if (artwork.cloudinaryId) {
    await deleteImageFromCloudinary(artwork.cloudinaryId);
  }

  await artwork.deleteOne();
  res.json({ message: "Artwork removed" });
});

// @desc    Get artworks by artist
// @route   GET /api/artworks/artist/:artistId
// @access  Public
const getArtworksByArtist = asyncHandler(async (req, res) => {
  const artworks = await Artwork.find({ artist: req.params.artistId }).populate(
    "artist",
    "name email"
  );
  res.json(artworks);
});

// @desc    Get artworks by userId
// @route   GET /api/artworks/user/:id
// @access  Public
const getArtworksByUserId = asyncHandler(async (req, res) => {
  const artworks = await Artwork.find({ artist: req.params.id }).populate("artist", "name email");
  res.json(artworks);
});


export {
  getArtworks,
  getArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  getArtworksByArtist,
  getArtworksByUserId,
};
