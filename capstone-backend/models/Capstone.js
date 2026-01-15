const mongoose = require("mongoose");

const currentYear = new Date().getFullYear();

const capstoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Capstone title is required!"],
      trim: true,
      maxlength: [500, "Capstone title cannot exceed 500 characters"],
    },
    abstract: {
      type: String,
      required: [true, "Abstract is required!"],
      trim: true,
      maxlength: [5000, "Abstract cannot exceed 5000 characters"],
    },
    // previewImage removed as per request
    members: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr)
          ? arr.map((s) => String(s).trim()).filter(Boolean)
          : [],
    },
    adviser: {
      type: String,
      trim: true,
      default: "",
    },
    year: {
      type: Number,
      required: [true, "Year is required!"],
      min: [1900, "Year is invalid"],
      max: [currentYear + 1, "Year is invalid"],
    },
    technologies: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr)
          ? arr.map((s) => String(s).trim()).filter(Boolean)
          : [],
    },
    pdfUrl: {
      type: String,
      trim: true,
      default: "",
    },
    pdfPublicId: {
      type: String,
      trim: true,
      default: "",
    },
    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

capstoneSchema.index({ isApproved: 1, isDeleted: 1, year: -1 });
capstoneSchema.index({
  title: "text",
  abstract: "text",
  technologies: "text",
  members: "text",
  adviser: "text",
});

module.exports = mongoose.model("Capstone", capstoneSchema);
