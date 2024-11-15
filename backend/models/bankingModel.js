const mongoose = require('mongoose')

const Schema = mongoose.Schema

// TODO you may not need to have the "id" fields,
// may just come with in mongodb


// Schema for each user account 
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    transactions: {
        type: [transactionSchema],
        required: false
    }
}, { timestamps: true })

// Schema for each transaction
const transactionSchema = new Schema({
    transName: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true
    },
    transType: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Banking', bankingSchema)