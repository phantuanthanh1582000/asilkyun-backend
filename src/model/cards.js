const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1/ASILKYUN')

const Schema = mongoose.Schema;

const cardSchema = new Schema({
    IdAccount: {
        type: String
    },
    productId: {
        type: String
    },
    productName: {
        type: String,
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
    collection: "cards"
});

const cardModel = mongoose.model('card', cardSchema);

module.exports = cardModel