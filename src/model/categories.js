const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://tphan10922:xERkoNaq6qkbNChW@cluster0.ubdtrjo.mongodb.net/ASILKYUN?retryWrites=true&w=majority&appName=Cluster0')

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