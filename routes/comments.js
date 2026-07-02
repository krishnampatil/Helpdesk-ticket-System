const express = require("express");
const router = express.Router();

const Comment = require("../models/Comment");
const Ticket = require("../models/Ticket");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// Create comment with file upload
router.post(
  "/:id/comments",
  auth,
  upload.array("attachments", 5),
  async (req, res) => {
    try {
      console.log("BODY:", req.body);
      console.log("FILES:", req.files);

      const { body, isInternal } = req.body || {};

      const files = req.files?.map((file) => file.path) || [];

      const ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({
          message: "Ticket not found"
        });
      }

      if (
        isInternal === "true" &&
        !["agent", "admin"].includes(req.user.role)
      ) {
        return res.status(403).json({
          message: "Only agent/admin can create internal notes"
        });
      }

      const comment = await Comment.create({
        ticket: req.params.id,
        author: req.user.id,
        body,
        isInternal: isInternal === "true",
        attachments: files
      });

      res.status(201).json(comment);

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

// Get comments
router.get("/:id/comments", auth, async (req, res) => {
  try {
    let comments;

    if (req.user.role === "customer") {
      comments = await Comment.find({
        ticket: req.params.id,
        isInternal: false
      }).populate("author", "name email role");
    } else {
      comments = await Comment.find({
        ticket: req.params.id
      }).populate("author", "name email role");
    }

    res.json(comments);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;