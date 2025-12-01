const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
    customerName: {type: String, required: true},
    items: [{
        productName: {type: String, required: true},
        productPrice: {type: Number, required: true},
        quantity: {type: Number, required: true}
    }],
    subtotal: {type: Number, required: true},
    delivery: {type: Boolean, default: false},
    deliveryFee: {type: Number, default: 0},
    total: {type: Number, required: true},
    date: {type: String, required: true},
    paymentMethod: {type: String, required: true},
    salesAgent: {type: String, required: true}
});

module.exports = mongoose.model("Sale", saleSchema);