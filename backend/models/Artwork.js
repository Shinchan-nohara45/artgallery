// backend/models/Artwork.js
import mongoose from "mongoose";

const artworkSchema = new mongoose.Schema(
  {
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Artist who uploaded the artwork
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    imageUrl: {
      type: String, // Cloudinary URL
      required: true,
    },
    cloudinaryId: {
      type: String, // public_id from Cloudinary
    },
    category: {
      type: String,
      required: true,
      enum: [
        "painting",
        "sculpture",
        "photography",
        "digital_art",
        "drawing",
        "mixed_media",
        "other",
      ],
      default: "other",
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    isForSale: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 1,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "User",
        },
        name: { type: String, required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
      },
    ],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Artwork = mongoose.model("Artwork", artworkSchema);

export default Artwork;
