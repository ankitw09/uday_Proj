const mongoose = require('mongoose');

const carts = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    }
});


module.exports = new  mongoose.model('carts',carts)