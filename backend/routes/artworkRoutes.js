import express from "express";
import {
  getArtworks,
  getArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  getArtworksByArtist,
  getArtworksByUserId, // ✅ import it
} from "../controllers/artworkController.js";
import { protect, admin, artist } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Fetch all artworks or create new one
router.route("/")
  .get(getArtworks)
  .post(protect, upload.single("artworkImage"), createArtwork);


router.get("/user/:id", getArtworksByUserId); 

// // ✅ fetch artworks by user (specific)
// router.get("/user/:id", getUserArtworks);

// Fetch/update/delete artwork by ID
router
  .route("/:id")
  .get(getArtworkById)
  .put(protect, upload.single("artworkImage"), updateArtwork)
  .delete(protect, deleteArtwork);

// Fetch artworks by artist
router.route("/artist/:artistId").get(getArtworksByArtist);

export default router;
