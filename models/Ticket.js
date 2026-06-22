const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "waiting", "resolved", "closed"],
      default: "open"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    attachments: [String],
    tags: [String],
    responseDeadline: Date,
    resolutionDeadline: Date,
    resolvedAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);