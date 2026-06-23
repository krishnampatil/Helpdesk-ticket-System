const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  body: {
    type: String,
    required: true
  },
  isInternal: {
    type: Boolean,
    default: false
  },
  attachments: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model("Comment", commentSchema);