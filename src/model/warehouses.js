const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1/ASILKYUN')

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