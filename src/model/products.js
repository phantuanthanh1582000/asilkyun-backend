const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1/ASILKYUN')

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