const express = require("express");
const router = express.router

router.get("/", (req, res) => {
    res.render("home")
})

module.exports = router;