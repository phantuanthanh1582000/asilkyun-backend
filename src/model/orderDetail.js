const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1/ASILKYUN')

const Schema = mongoose.Schema;

const orderDetailSchema = new Schema({
    IdAccount: {
        type: String
    },
    orderId: {
      type: String  
    },
    productId: {
        type: String
    },
    productName: {
        type: String
    },
    size: {
        type: String
    },
    amount: {
        type: Number
    },
    total: {
        type: Number
    },
}, {
    collection: "orderDetails"
});

const orderDetailModel = mongoose.model('orderDetail', orderDetailSchema);

module.exports = orderDetailModel