const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1/ASILKYUN')

const Schema = mongoose.Schema;

const categorySchema = new Schema({
    categoryName: {
        type: String,
    }
}, {
    collection: "categories"
});

const categoryModel = mongoose.model('category', categorySchema);

module.exports = categoryModel