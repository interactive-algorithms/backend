const express = require("express")
const router = express.Router();

const userRoutes = require("./users.js");
const articleRoutes = require("./articles.js");

router.use("/users", userRoutes)
router.use("/articles", articleRoutes);

module.exports = router;