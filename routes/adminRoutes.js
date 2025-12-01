const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Furniturestock = require("../models/Furniturestock");
const Woodstock = require("../models/Woodstock");
const User = require("../models/User");

// Admin Dashboard
router.get("/admindashboard", async (req, res) => {
    try {
        // Get all sales
        const allSales = await Sale.find();
        
        // Calculate total revenue
        let totalRevenue = 0;
        allSales.forEach(sale => {
            totalRevenue += sale.total;
        });
        
        // Get sales count
        const totalSalesCount = allSales.length;
        
        // Get all furniture
        const allFurniture = await Furniturestock.find();
        
        // Find furniture with low stock (less than 5)
        const lowStockFurniture = [];
        allFurniture.forEach(item => {
            if (item.quantity < 5) {
                lowStockFurniture.push(item);
            }
        });
        
        // Get all wood
        const allWood = await Woodstock.find();
        
        // Find wood with low stock (less than 5)
        const lowStockWood = [];
        allWood.forEach(item => {
            if (item.quantity < 5) {
                lowStockWood.push(item);
            }
        });
        
        // Get all sales agents
        const salesAgents = await User.find({ role: "Sales_agent" });
        
        // Calculate performance for each agent
        const agentPerformance = [];
        for (let agent of salesAgents) {
            const agentName = agent.fname + " " + agent.lname;
            
            // Count sales for this agent
            let agentSalesCount = 0;
            let agentRevenue = 0;
            
            allSales.forEach(sale => {
                if (sale.salesAgent === agentName) {
                    agentSalesCount = agentSalesCount + 1;
                    agentRevenue = agentRevenue + sale.total;
                }
            });
            
            agentPerformance.push({
                name: agentName,
                totalSales: agentSalesCount,
                totalRevenue: agentRevenue
            });
        }
        
        // Get recent sales (last 10)
        const allSalesSorted = await Sale.find().sort({ date: -1 });
        const recentSales = allSalesSorted.slice(0, 10);
        
        res.render("admindashboard", {
            totalRevenue,
            totalSalesCount,
            lowStockFurniture,
            lowStockWood,
            agentPerformance,
            recentSales
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading admin dashboard");
    }
});

// View all sales
router.get("/allsales", async (req, res) => {
    try {
        const sales = await Sale.find().sort({ date: -1 });
        res.render("allsales", { sales });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading sales");
    }
});

// View stock levels
router.get("/stocklevels", async (req, res) => {
    try {
        const furniture = await Furniturestock.find().sort({ quantity: 1 });
        const wood = await Woodstock.find().sort({ quantity: 1 });
        res.render("stocklevels", { furniture, wood });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading stock levels");
    }
});

module.exports = router;