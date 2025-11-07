const express = require("express");
const router = express.Router();
const User = require("../models/User");
const passport = require("passport")

router.get("/signup", (req, res) => {
    res.render("signup")
});

router.post("/signup", async(req, res) =>{
    try {
        const newUser = new User(req.body);

        let user = await User.findOne({
            email: req.body.email
        });

        if(user){
            return res.status(400).send("User already exists");
        }else{
            await User.register(newUser, req.body.password, (error) =>{
                if(error){
                    throw error;
                }
            });
            res.redirect("/")
        }
    } catch (error) {
        console.error(error);
        res.status(400).send("Sorry, something went wrong");
    }
});

router.get("/signin", (req, res) => {
    res.render("signin")

});

router.post("/signin", passport.authenticate("local", {successRedirect: "/", failureRedirect: "/signin"}));

module.exports = router;