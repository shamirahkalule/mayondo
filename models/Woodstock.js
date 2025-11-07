const mongoose = require("mongoose");

const woodstockSchema = new mongoose.Schema ({
    woodType: {type: String, required: true},
    woodName: {type: String, required: true},
    quantity: {type: Number, required: true}, 
    costPrice: {type: Number, required: true},
    productPrice: {type: Number, required: true},
    supplierName: {type: String, required: true},
    date: {type: String, required: true},
    productQuality: {type: String, required: true},
    color: {type: String},
    measurement: {type: String},
    image: {type: String}
});


module.exports =mongoose.model("Woodstock", woodstockSchema )