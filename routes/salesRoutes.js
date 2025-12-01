const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");
const Furniturestock = require("../models/Furniturestock");
const Woodstock = require("../models/Woodstock");

// Dashboard route
router.get("/dashboard", async (req, res) => {
    try {
        const totalSales = await Sale.countDocuments();
        const totalCustomers = await Customer.countDocuments();
        const recentSales = await Sale.find().limit(5).sort({date: -1});
        
        res.render("dashboard", {
            totalSales,
            totalCustomers,
            recentSales
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading dashboard");
    }
});

// Customer routes
router.get("/addcustomer", (req, res) => {
    res.render("addcustomer");
});

router.post("/addcustomer", async (req, res) => {
    try {
        const newCustomer = new Customer(req.body);
        await newCustomer.save();
        res.redirect("/dashboard");
    } catch (error) {
        console.error(error);
        res.redirect("/addcustomer");
    }
});

router.get("/customers", async (req, res) => {
    try {
        const customers = await Customer.find();
        res.render("customers", {customers});
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading customers");
    }
});

// Close sale routes
router.get("/closesale", async (req, res) => {
    try {
        const customers = await Customer.find();
        const furniture = await Furniturestock.find();
        const wood = await Woodstock.find(); 
        res.render("closesale", {customers, furniture, wood});
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading sale page");
    }
});

router.post("/closesale", async (req, res) => {
    try {
        const newSale = new Sale(req.body);
        await newSale.save();
        res.redirect("/dashboard");
    } catch (error) {
        console.error(error);
        res.redirect("/closesale");
    }
});

module.exports = router;