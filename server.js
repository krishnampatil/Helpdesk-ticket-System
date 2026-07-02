const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/tickets", require("./routes/tickets"));
app.use("/tickets", require("./routes/comments"));
app.use("/admin", require("./routes/admin"));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});