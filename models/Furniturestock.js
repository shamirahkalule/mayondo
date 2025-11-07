const mongoose = require("mongoose")

const furniturestockSchema = new mongoose.Schema ({
    productType: {type: String, required: true},
    name: {type: String, required: true},
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

module.exports = mongoose.model("Furniturestock", furniturestockSchema)