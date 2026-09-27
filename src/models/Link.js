const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    shortCode: { type: String, required: true, unique: true, index: true },
    originalUrl: { type: String, required: true },
    label: { type: String, default: "" },
    clicks: { type: Number, default: 0 },
    lastClickedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Link", linkSchema);
