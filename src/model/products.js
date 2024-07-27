const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://tphan10922:xERkoNaq6qkbNChW@cluster0.ubdtrjo.mongodb.net/ASILKYUN?retryWrites=true&w=majority&appName=Cluster0')

const Schema = mongoose.Schema;

const productSchema = new Schema({
    categoryId: {
        type: String,
        ref: 'category'
    },
    productName: {
        type: String
    },
    productPrice: {
        type: Number
    },
    productImg: {
        type: String
    },
    productImgDetail: {
        type: [String]
    }, 
    warehouse: {
        type: [String],
        default: [],
        ref: 'warehouse'
    }, 
    productMaterial: {
        type: String
    },
    productDescription: {
        type: String
    },
    datePosted: {
        type: Date,
        default: Date.now 
    }
}, {
    collection: "products"
});

const productModel = mongoose.model('product', productSchema);

module.exports = productModel