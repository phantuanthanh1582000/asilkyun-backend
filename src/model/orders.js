const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://tphan10922:xERkoNaq6qkbNChW@cluster0.ubdtrjo.mongodb.net/ASILKYUN?retryWrites=true&w=majority&appName=Cluster0')

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    userId: {
        type: String
    },
    fullName: {
        type: String
    },
    email: {
        type: String
    },
    ward: {
        type: String
    },
    district: {
        type: String
    },
    address: {
        type: String
    },
    province: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    totalAmount: {
        type: Number
    }, 
    totalPrice: {
        type: Number
    },
    paymentMethod: {
        type: String
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Number,
        default: 1
    }
}, {
    collection: "orders"
});

const orderModel = mongoose.model('order', orderSchema);

module.exports = orderModel