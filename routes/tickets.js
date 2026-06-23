const express = require("express");
const Ticket = require("../models/Ticket");
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");

const router = express.Router();

router.post("/", auth, rbac("customer"), async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      priority,
      createdBy: req.user.id
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    let tickets;

    if (req.user.role === "customer") {
      tickets = await Ticket.find({
        createdBy: req.user.id
      })
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email");
    } else {
      tickets = await Ticket.find()
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email");
    }

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    if (
      req.user.role === "customer" &&
      ticket.createdBy._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch(
  "/:id/status",
  auth,
  rbac("agent", "admin"),
  async (req, res) => {
    try {
      const { status } = req.body;

      const ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({
          message: "Ticket not found"
        });
      }

      ticket.status = status;

      if (status === "resolved") {
        ticket.resolvedAt = new Date();
      }

      await ticket.save();

      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/:id/assign",
  auth,
  rbac("agent", "admin"),
  async (req, res) => {
    try {
      const { assignedTo } = req.body;

      const ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({
          message: "Ticket not found"
        });
      }

      ticket.assignedTo = assignedTo;

      await ticket.save();

      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.delete(
  "/:id",
  auth,
  rbac("admin"),
  async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({
          message: "Ticket not found"
        });
      }

      await ticket.deleteOne();

      res.json({
        message: "Ticket deleted"
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { body, isInternal } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    if (
      isInternal &&
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
      isInternal
    });

    res.status(201).json(comment);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

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