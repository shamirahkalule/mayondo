const express = require("express");
const router = express.Router();
const Furniturestock = require("../models/Furniturestock");
const Woodstock = require("../models/Woodstock");
const multer = require("multer");

var storage = multer.diskStorage({
  destination:  (req, file, cb) => {
    cb(null, "public/images/uploads")
  },
  filename:  (req, file, cb) => {
    cb(null, file.originalname)
  }
});

var upload = multer({ storage: storage });

// Stock Levels Route
router.get("/stocklevels", async (req, res) => {
  try {
    // Fetch all furniture and wood
    const furniture = await Furniturestock.find().sort({ quantity: 1 });
    const wood = await Woodstock.find().sort({ quantity: 1 });
    
    // Categorize furniture by stock level
    const furnitureLowStock = furniture.filter(item => item.quantity < 5);
    const furnitureWarningStock = furniture.filter(item => item.quantity >= 5 && item.quantity < 10);
    const furnitureGoodStock = furniture.filter(item => item.quantity >= 10);
    
    // Categorize wood by stock level
    const woodLowStock = wood.filter(item => item.quantity < 5);
    const woodWarningStock = wood.filter(item => item.quantity >= 5 && item.quantity < 10);
    const woodGoodStock = wood.filter(item => item.quantity >= 10);
    
    // Calculate totals
    const furnitureStats = {
      total: furniture.length,
      lowStock: furnitureLowStock.length,
      warning: furnitureWarningStock.length,
      good: furnitureGoodStock.length
    };
    
    const woodStats = {
      total: wood.length,
      lowStock: woodLowStock.length,
      warning: woodWarningStock.length,
      good: woodGoodStock.length
    };
    
    res.render("stocklevels", {
      furniture,
      wood,
      furnitureLowStock,
      furnitureWarningStock,
      furnitureGoodStock,
      woodLowStock,
      woodWarningStock,
      woodGoodStock,
      furnitureStats,
      woodStats
    });
  } catch (error) {
    console.error("Error loading stock levels:", error);
    res.status(500).send("Error loading stock levels");
  }
});

// Display Furniture Route
router.get("/displayfurniture", async (req, res) => {
  try {
    const furnitureList = await Furniturestock.find().sort({ date: -1 });
    res.render("displayfurniture", { furnitureList });
  } catch (error) {
    console.error("Error fetching furniture:", error);
    res.status(500).send("Error loading furniture");
  }
});

// Display Wood Route
router.get("/displaywood", async (req, res) => {
  try {
    const woodList = await Woodstock.find().sort({ date: -1 });
    res.render("displaywood", { woodList });
  } catch (error) {
    console.error("Error fetching wood:", error);
    res.status(500).send("Error loading wood");
  }
});

// Register Furniture Routes
router.get("/regfurniture", (req, res) => {
  res.render("regfurniture");
});

router.post("/regfurniture", upload.single("image"), async(req, res) => {
    try{
        if (!req.body || Object.keys(req.body).length === 0) {
            console.error('req.body is empty!');
            return res.status(400).send('Form data is empty');
        }

        const data = {
            ...req.body,                  
            image: req.file ? `/images/uploads/${req.file.filename}` : null ,     
        };

        const newFurniture = new Furniturestock(data);
        await newFurniture.save()
        res.redirect("/")

    }catch(error) {
        console.error(error);
        res.redirect("/regfurniture")
    }
});

// Register Wood Routes
router.get("/regwood", (req, res) => {
  res.render("regwood");
});

router.post("/regwood", upload.single("image"), async(req, res) =>{
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            console.error('req.body is empty!');
            return res.status(400).send('Form data is empty');
        }

        const data = {
            ...req.body,                  
            image: req.file ? `/images/uploads/${req.file.filename}` : null     
        };

        const newWood = new Woodstock(data);
        await newWood.save();
        res.redirect("/")
    } catch(error) {
        console.error(error);
        res.redirect("/regwood")
    }
});


// Edit Furniture Routes
router.get("/editfurniture/:id", async (req, res) => {
  try {
    const furniture = await Furniturestock.findById(req.params.id);
    if (!furniture) {
      return res.status(404).send("Furniture not found");
    }
    res.render("editfurniture", { furniture });
  } catch (error) {
    console.error("Error loading furniture:", error);
    res.status(500).send("Error loading furniture");
  }
});

router.put("/editfurniture/:id", async (req, res) => {
  try {
    await Furniturestock.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true, message: "Furniture updated successfully" });
  } catch (error) {
    console.error("Error updating furniture:", error);
    res.status(500).json({ success: false, message: "Error updating furniture" });
  }
});

// Edit Wood Routes
router.get("/editwood/:id", async (req, res) => {
  try {
    const wood = await Woodstock.findById(req.params.id);
    if (!wood) {
      return res.status(404).send("Wood not found");
    }
    res.render("editwood", { wood });
  } catch (error) {
    console.error("Error loading wood:", error);
    res.status(500).send("Error loading wood");
  }
});

router.put("/editwood/:id", async (req, res) => {
  try {
    await Woodstock.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true, message: "Wood updated successfully" });
  } catch (error) {
    console.error("Error updating wood:", error);
    res.status(500).json({ success: false, message: "Error updating wood" });
  }
});

module.exports = router;