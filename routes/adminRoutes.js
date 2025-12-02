const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Furniturestock = require("../models/Furniturestock");
const Woodstock = require("../models/Woodstock");
const { isAuthenticated, isManager } = require("../middleware/auth");

// Admin Dashboard Route
router.get("/admindashboard", isAuthenticated, isManager, async (req, res) => {
  try {
    // Fetch all sales
    const allSales = await Sale.find().sort({ date: -1 });
    
    // Fetch furniture and wood stock
    const furniture = await Furniturestock.find();
    const wood = await Woodstock.find();
    
    // Calculate total revenue
    const totalRevenue = allSales.reduce((sum, sale) => sum + sale.total, 0);
    
    // Calculate revenue for last week (for comparison)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const lastWeekSales = allSales.filter(sale => new Date(sale.date) >= oneWeekAgo);
    const lastWeekRevenue = lastWeekSales.reduce((sum, sale) => sum + sale.total, 0);
    
    // Calculate two weeks ago revenue for percentage
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const prevWeekSales = allSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= twoWeeksAgo && saleDate < oneWeekAgo;
    });
    const prevWeekRevenue = prevWeekSales.reduce((sum, sale) => sum + sale.total, 0);
    
    // Calculate percentage change
    const revenueChange = prevWeekRevenue > 0 
      ? ((lastWeekRevenue - prevWeekRevenue) / prevWeekRevenue * 100).toFixed(1)
      : 0;
    
    // Sales count and change
    const lastWeekSalesCount = lastWeekSales.length;
    const prevWeekSalesCount = prevWeekSales.length;
    const salesChange = prevWeekSalesCount > 0
      ? ((lastWeekSalesCount - prevWeekSalesCount) / prevWeekSalesCount * 100).toFixed(1)
      : 0;
    
    // Find low stock items (less than 5 units)
    const lowStockFurniture = furniture.filter(item => item.quantity < 5);
    const lowStockWood = wood.filter(item => item.quantity < 5);
    const lowStockCount = lowStockFurniture.length + lowStockWood.length;
    
    // Get sales by agent
    const salesByAgent = {};
    allSales.forEach(sale => {
      if (!salesByAgent[sale.salesAgent]) {
        salesByAgent[sale.salesAgent] = {
          name: sale.salesAgent,
          salesCount: 0,
          totalRevenue: 0
        };
      }
      salesByAgent[sale.salesAgent].salesCount++;
      salesByAgent[sale.salesAgent].totalRevenue += sale.total;
    });
    
    const agentPerformance = Object.values(salesByAgent)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    // Get recent sales (last 10)
    const recentSales = allSales.slice(0, 10);
    
    // Prepare weekly data for charts (last 7 days)
    const last7Days = [];
    const salesByDay = {};
    const revenueByDay = {};
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      last7Days.push(dayKey);
      salesByDay[dayKey] = 0;
      revenueByDay[dayKey] = 0;
    }
    
    allSales.forEach(sale => {
      const saleDate = new Date(sale.date).toISOString().split('T')[0];
      if (salesByDay.hasOwnProperty(saleDate)) {
        salesByDay[saleDate]++;
        revenueByDay[saleDate] += sale.total;
      }
    });
    
    const dailySalesData = last7Days.map(day => salesByDay[day]);
    const dailyRevenueData = last7Days.map(day => Math.round(revenueByDay[day]));
    
    res.render("admindashboard", {
      totalRevenue: Math.round(totalRevenue),
      revenueChange,
      totalSales: allSales.length,
      salesChange,
      lowStockCount,
      agentPerformance,
      recentSales,
      lowStockFurniture,
      lowStockWood,
      dailySalesData,
      dailyRevenueData,
      user: req.user
    });
  } catch (error) {
    console.error("Error loading admin dashboard:", error);
    res.status(500).send("Error loading dashboard");
  }
});

module.exports = router;