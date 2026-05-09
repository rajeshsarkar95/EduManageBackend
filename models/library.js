const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Textbook",
        "Novel",
        "Reference",
        "Magazine",
        "Comics",
        "Biography",
        "Science",
        "History",
        "Other",
      ],
      default: "Textbook",
    },

    totalCopies: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    available: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },

    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Book", bookSchema);