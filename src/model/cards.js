const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://tphan10922:xERkoNaq6qkbNChW@cluster0.ubdtrjo.mongodb.net/ASILKYUN?retryWrites=true&w=majority&appName=Cluster0')

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