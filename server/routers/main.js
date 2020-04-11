const express = require("express")
const router = express.Router();

const userRoutes = require("./users.js");
const articleRoutes = require("./articles.js");
const messagesRoutes = require("./messages.js");

router.use("/users", userRoutes)
router.use("/articles", articleRoutes);
router.use("/messages", messagesRoutes);

module.exports = router;