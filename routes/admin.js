const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Ticket = require("../models/Ticket");
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");


// Get all users
router.get(
  "/users",
  auth,
  rbac("admin"),
  async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.json(users);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);


// Update user role / deactivate
router.patch(
  "/users/:id",
  auth,
  rbac("admin"),
  async (req, res) => {
    try {
      const { role, isActive } = req.body;

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      if (role) user.role = role;
      if (typeof isActive === "boolean") user.isActive = isActive;

      await user.save();

      res.json(user);

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);


// Delete user
router.delete(
  "/users/:id",
  auth,
  rbac("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      await user.deleteOne();

      res.json({
        message: "User deleted"
      });

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);


// Analytics overview
router.get(
  "/analytics/overview",
  auth,
  rbac("admin"),
  async (req, res) => {
    try {
      const totalTickets = await Ticket.countDocuments();

      const openTickets = await Ticket.countDocuments({
        status: "open"
      });

      const resolvedTickets = await Ticket.countDocuments({
        status: "resolved"
      });

      res.json({
        totalTickets,
        openTickets,
        resolvedTickets
      });

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);


// Analytics by status
router.get(
  "/analytics/by-status",
  auth,
  rbac("admin"),
  async (req, res) => {
    try {
      const data = await Ticket.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);

      res.json(data);

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);


// Analytics by agent
router.get(
  "/analytics/by-agent",
  auth,
  rbac("admin"),
  async (req, res) => {
    try {
      const data = await Ticket.aggregate([
        {
          $match: {
            assignedTo: { $ne: null }
          }
        },
        {
          $group: {
            _id: "$assignedTo",
            total: { $sum: 1 }
          }
        }
      ]);

      res.json(data);

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

module.exports = router;