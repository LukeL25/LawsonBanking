const mongoose = require('mongoose')

const Schema = mongoose.Schema

// TODO you may not need to have the "id" fields,
// may just come with in mongodb


// Schema for each user account 
const userSchema = new Schema({
    userId: {
        type: String,
        required: true

    },
    name: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    transaction: {
        type: [transactionSchema],
        required: false
    }
}, { timestamps: true })

// Schema for each transaction
const transactionSchema = new Schema({
    transactionId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    transactionType: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Banking', bankingSchema)