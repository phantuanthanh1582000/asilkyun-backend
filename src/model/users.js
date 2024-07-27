const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://tphan10922:xERkoNaq6qkbNChW@cluster0.ubdtrjo.mongodb.net/ASILKYUN?retryWrites=true&w=majority&appName=Cluster0')

const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullName: {
        type: String
    },
    IdAccount: {
        type: String
    },
    password: {
        type: String
    },
    role: {
        type: Number,
        default: 1
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
    }
}, {
    collection: "users"
});

const userModel = mongoose.model('user', userSchema);

module.exports = userModel