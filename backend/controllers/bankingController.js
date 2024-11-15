const Banking = require('../models/bankingModel')
const mongoose = require('mongoose')

// get all account transactions
const getAccounts = async (req, res) => {
    const accounts = await Banking.find({}).sort({createdAt: -1})

    res.status(200).json(accounts)
}

// get a single transaction
const getAccount = async (req, res) => {
    const { id } = req.params 
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such account'})
    }

    const account = await Banking.findById(id)

    if (!account) {
        return res.status(404).json({error: 'No such account'})
    }

    res.status(200).json(account)
}

// create new user account
const createAccount = async (req, res) => {
    const {name, balance, transactions} = req.body

    // add doc to db
    try {
        const account = await Banking.create({name, balance, transactions})
        res.status(200).json(account)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// TODO me playing around with creating a transaction within 
// an already created user account
const mockCreateTransaction = async (req, res) => {
    const {userId, transName, amount, transType} = req.body;

    // Create new transaction
    const newTransaction = {
        transName,
        amount,
        transType
    };

    try {
        // Find the existing user by its ID and add the transaction entry
        const updatedUser = await Workout.findByIdAndUpdate (
            userId,
            { $push: { transactions: newTransaction } },
            { new: true } // Option to return the updated workout document
        );


        // If the workout is not found, return an error
        if (!updatedUser) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        // Return the updated workout document
        res.status(200).json(updatedUser);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


// delete a workout
const deleteAccount = async (req,res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such account'})
    }

    const account = await Banking.findOneAndDelete({ _id: id })

    if (!account) {
        return res.status(404).json({error: 'No such account'})
    }

    res.status(200).json(account)
}

// update a workout
const updateAccount = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such account'})
    }

    const account = await Banking.findOneAndUpdate({ _id: id }, {
        ...req.body
    })

    if (!account) {
        return res.status(404).json({error: 'No such account'})
    }

    res.status(200).json(account)
}


module.exports = {
    getAccounts,
    getAccount,
    createAccount,
    deleteAccount,
    updateAccount
}