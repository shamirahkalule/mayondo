const express = require("express");
const router = express.Router();
const Woodstock = require("../models/Woodstock");
const Furniturestock = require("../models/Furniturestock")
const multer = require("multer");

//image upload configurations
var storage = multer.diskStorage({
  destination:  (req, file, cb) => {
    cb(null, "public/images/uploads")
  },
  filename:  (req, file, cb) => {
    cb(null, file.originalname)
  }
});

var upload = multer({ storage: storage });

//wood routes
router.get("/regwood", (req, res) =>{
    res.render("regwood")
});

//adding wood to the database 
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


//Furniture routes
router.get("/regfurniture", (req, res) => {
    res.render("regfurniture")
});

//adding furniture to the database
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

//wood display routes
router.get("/displaywood", async (req, res) => {
    try{
        const woodList = await Woodstock.find();
        res.render("displaywood", {woodList});
    }catch(error){
        console.error(error);
        res.status(500).send("Error fetching wood data");
    }   
});

//furniture display routes
router.get("/displayfurniture", async (req, res) => {
    try{
        const furnitureList = await Furniturestock.find();
        res.render("displayfurniture", {furnitureList});
    }catch(error){
        console.error(error);
        res.status(500).send("Error fetching wood data");
    }   
});

//editing furniture
router.get("/editfurniture/:id", async(req, res) => {
    try{
        const furnitureId = req.params.id;
        const furniture = await Furniturestock.findById(furnitureId);
        res.render("editfurniture", {furniture});
    }catch (error) {
        console.error(error);
        res.status(500).send("Error fetching furniture data");
    }
})

router.put("/editfurniture/:id", async(req, res) => {
    try {
        const furnitureId = req.params.id;
        const updatedata = req.body;
        const updatedFurniture = await Furniturestock.findByIdAndUpdate(
            furnitureId,
            updatedata,
            {new: true, runValidators: true}
        );

        if (!updatedFurniture) {
            return res.status(404).json({ message: 'Furniture not found' });
        }
    
        res.json({ message: 'Updated successfully', furniture: updatedFurniture });
        
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating furniture data");
    }
})


//editing wood
router.get("/editwood/:id", async(req, res) => {
    try {
        const woodId = req.params.id;
        const wood = await Woodstock.findById(woodId);

        res.render("editwood", {wood});
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching wood data");
    }
})

router.put("/editwood/:id", async(req, res) => {
    try {
        const woodId = req.params.id;
        const updatedata = req.body;
        const updatedWood = await Woodstock.findByIdAndUpdate(
            woodId,
            updatedata,
            {new: true, runValidators: true}
        );

        if (!updatedWood) {
            return res.status(404).json({ message: 'Wood not found' });
        }
    
        res.json({ message: 'Updated successfully', wood: updatedWood });
        
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating wood data");
    }
})


module.exports = router;