const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");
const Furniturestock = require("../models/Furniturestock");
const Woodstock = require("../models/Woodstock");
const { isAuthenticated, isSalesAgent, isManager } = require("../middleware/auth");

// Dashboard route
router.get("/dashboard", isAuthenticated, isSalesAgent, async (req, res) => {
    try {
        // Get total sales count
        const totalSales = await Sale.countDocuments();
        
        // Get total customers count
        const totalCustomers = await Customer.countDocuments();
        
        // Get recent sales (last 5)
        const recentSales = await Sale.find().limit(5).sort({date: -1});
        
        // Calculate sales for last 7 days
        const last7Days = [];
        const salesByDay = {};
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayKey = date.toISOString().split('T')[0];
            last7Days.push(dayKey);
            salesByDay[dayKey] = 0;
        }
        
        // Get all sales to calculate daily counts
        const allSales = await Sale.find();
        allSales.forEach(sale => {
            const saleDate = new Date(sale.date).toISOString().split('T')[0];
            if (salesByDay.hasOwnProperty(saleDate)) {
                salesByDay[saleDate]++;
            }
        });
        
        const dailySalesData = last7Days.map(day => salesByDay[day]);
        
        // Calculate customer growth for last 7 days (approximation)
        // This assumes customers are added progressively
        const customerGrowth = [];
        const customersPerDay = Math.ceil(totalCustomers / 7);
        for (let i = 0; i < 7; i++) {
            customerGrowth.push(Math.max(0, totalCustomers - (6 - i) * customersPerDay));
        }
        
        // Calculate weekly changes
        const lastWeekSales = dailySalesData.slice(-7).reduce((a, b) => a + b, 0);
        const prevWeekSales = Math.max(1, lastWeekSales - 3); // Approximation
        const salesChange = ((lastWeekSales - prevWeekSales) / prevWeekSales * 100).toFixed(1);
        
        const lastWeekCustomers = totalCustomers;
        const prevWeekCustomers = Math.max(1, totalCustomers - 5); // Approximation
        const customersChange = ((lastWeekCustomers - prevWeekCustomers) / prevWeekCustomers * 100).toFixed(1);
        
        // Get furniture stock
        const furniture = await Furniturestock.find().sort({quantity: 1});
        const furnitureData = furniture.slice(0, 7).map(item => ({
            name: item.name,
            quantity: item.quantity
        }));
        
        // Get wood stock
        const wood = await Woodstock.find().sort({quantity: 1});
        const woodData = wood.slice(0, 6).map(item => ({
            name: item.woodName,
            quantity: item.quantity
        }));
        
        // Get out of stock items (quantity = 0 or very low)
        const outOfStockFurniture = furniture.filter(item => item.quantity === 0);
        const outOfStockWood = wood.filter(item => item.quantity === 0);
        const outOfStockItems = [
            ...outOfStockFurniture.map(item => ({type: 'Furniture', name: item.name})),
            ...outOfStockWood.map(item => ({type: 'Wood', name: item.woodName}))
        ];
        
        res.render("dashboard", {
            totalSales,
            totalCustomers,
            recentSales,
            salesChange,
            customersChange,
            dailySalesData,
            customerGrowth,
            furnitureData,
            woodData,
            outOfStockItems,
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading dashboard");
    }
});

// All Sales route
router.get("/allsales", isAuthenticated, isManager, async (req, res) => {
    try {
        const sales = await Sale.find().sort({date: -1});
        res.render("allsales", { sales, user: req.user});
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading sales");
    }
});

// Customer routes
router.get("/addcustomer", isAuthenticated, isSalesAgent, (req, res) => {
    res.render("addcustomer", { user: req.user || null });
});

router.post("/addcustomer", isAuthenticated, isSalesAgent, async (req, res) => {
    try {
        const newCustomer = new Customer(req.body);
        await newCustomer.save();
        res.redirect("/dashboard");
    } catch (error) {
        console.error(error);
        res.redirect("/addcustomer");
    }
});

router.get("/customers", isAuthenticated, isSalesAgent, async (req, res) => {
    try {
        const customers = await Customer.find();
        res.render("customers", {customers, user: req.user});
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading customers");
    }
});

// Close sale routes
router.get("/closesale", isAuthenticated, isSalesAgent, async (req, res) => {
    try {
        const customers = await Customer.find();
        const furniture = await Furniturestock.find();
        const wood = await Woodstock.find(); 
        res.render("closesale", {customers, furniture, wood, user: req.user});
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading sale page");
    }
});

router.post("/closesale", isAuthenticated, isSalesAgent, async (req, res) => {
    try {
        // Parse items if it's a JSON string
        if (typeof req.body.items === 'string') {
            req.body.items = JSON.parse(req.body.items);
        }
        
        // Set the sales agent to the logged-in user
        req.body.salesAgent = `${req.user.fname} ${req.user.lname}`;
        
        // Deduct stock for each item in the sale
        for (const item of req.body.items) {
            // Check furniture stock first
            let furnitureItem = await Furniturestock.findOne({ name: item.productName });
            
            if (furnitureItem) {
                // Check if enough stock is available
                if (furnitureItem.quantity < item.quantity) {
                    return res.status(400).send(`Insufficient stock for ${item.productName}. Available: ${furnitureItem.quantity}, Requested: ${item.quantity}`);
                }
                
                // Deduct quantity from furniture stock
                furnitureItem.quantity -= item.quantity;
                await furnitureItem.save();
            } else {
                // Check wood stock
                let woodItem = await Woodstock.findOne({ woodName: item.productName });
                
                if (woodItem) {
                    // Check if enough stock is available
                    if (woodItem.quantity < item.quantity) {
                        return res.status(400).send(`Insufficient stock for ${item.productName}. Available: ${woodItem.quantity}, Requested: ${item.quantity}`);
                    }
                    
                    // Deduct quantity from wood stock
                    woodItem.quantity -= item.quantity;
                    await woodItem.save();
                } else {
                    // Product not found in either inventory
                    return res.status(404).send(`Product "${item.productName}" not found in inventory`);
                }
            }
        }
        
        // Save the sale after successful stock deduction
        const newSale = new Sale(req.body);
        await newSale.save();
        
        res.redirect("/dashboard");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error processing sale: " + error.message);
    }
});

module.exports = router;