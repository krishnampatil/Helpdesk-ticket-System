const express = require("express");
const Comment = require("../models/Comment");
const Ticket = require("../models/Ticket");
const auth = require("../middleware/auth");

const router = express.Router();

module.exports = router;