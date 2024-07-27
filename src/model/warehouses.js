const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://tphan10922:xERkoNaq6qkbNChW@cluster0.ubdtrjo.mongodb.net/ASILKYUN?retryWrites=true&w=majority&appName=Cluster0')

const Schema = mongoose.Schema;

const warehouseSchema = new Schema({
    productId: {
        type: String
    },
    size: {
        type: String
    },
    amount: {
        type: Number
    }
}, {
    collection: "warehouses"
});

const warehouseModel = mongoose.model('warehouse', warehouseSchema);

module.exports = warehouseModel