const mongoose = require('mongoose');

const userScheme = new mongoose.Schema({
    firstName: {
        type: String,
        required: true 
    },
    lastName: {
        type: String,
        required: true
    },
    nickName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    
    
    money: {    
        type: Number,
        default: 0
    },
    exp: {
        type: Number,
        default: 1000
    },
    icon: {
        type: String,
        required: false,
        default: "icon_council.png"
    },
    characters: [],

    buyHistory: [],

    checked: {
        type: Boolean,
        default: false
    },
    passCode: {
        type: String,
        default: null
    }
});

console.log('Esquema de Usuário construído, porém não inicializado.');
mongoose.model('user', userScheme);