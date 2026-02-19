// backend/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    username: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined initially if needed, but we'll try to enforce it
      minlength: 3,
      maxlength: 30,
      match: [/^[a-z0-9._-]+$/, 'Username can only contain lowercase letters, numbers, underscores, dots, and dashes.'],
      validate: {
        validator: function(v) {
          // Check for single dash and single dot if acceptable, or just general "no consecutive"
          // User asked: "single dash allowed and single dot(.)"
          // Literal interpretation: max one dash and max one dot in the whole string?
          // Let's assume lenient first: just preventing consecutive special chars is usually better UX.
          // But if strict: (v.match(/\-/g) || []).length <= 1 && (v.match(/\./g) || []).length <= 1
          if (!v) return true; // allow empty if sparse handling
          const dashCount = (v.match(/-/g) || []).length;
          const dotCount = (v.match(/\./g) || []).length;
          return dashCount <= 1 && dotCount <= 1;
        },
        message: 'Username can contain at most one dash and one dot.'
      }
    },

    password: {
      type: String,
      required: function () {
        // Password is not required if user signed up with Google or Firebase
        return !this.googleId && !this.firebaseUid;
      },
    },

    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },

    isArtist: {
      type: Boolean,
      default: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    firebaseUid: {
      type: String,
      unique: true,
      sparse: true, // allows null/undefined but enforces uniqueness when set
    },

    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/your_cloud_name/image/upload/v1/default-profile.png",
    },
    
    // Adding imageUrl to match controller usage
    imageUrl: {
        type: String,
    },

    bio: {
      type: String,
      maxlength: 500,
    },

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artwork",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    socialLinks: [
      {
        platform: String,
        url: String,
      },
    ],
    shippingAddress: {
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    billingAddress: {
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    addresses: [
      {
        label: { type: String }, // Home, Work, Other
        address: { type: String },
        city: { type: String },
        postalCode: { type: String },
        country: { type: String },
        isDefault: { type: Boolean, default: false }
      }
    ],
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving (skip for Google/Firebase users)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.googleId || this.firebaseUid) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Firebase/Google users don’t use local passwords
  if (this.googleId || this.firebaseUid) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
