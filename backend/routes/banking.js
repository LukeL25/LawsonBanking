const express = require('express')
const {
    createAccount,
    getAccounts,
    getAccount,
    deleteAccount,
    updateAccount,
    updateTransactions,
    deleteTransaction,
    updateTransaction
} = require('../controllers/bankingController')

const router = express.Router()

// GET all workouts
router.get('/', getAccounts)

// GET a single workout
router.get('/:id', getAccount)

// POST a new workout
router.post('/', createAccount)

// DELETE a workout
router.delete('/:id', deleteAccount)

// UPDATE a workout
router.patch('/:id', updateAccount)

// POST a new transaction
router.put('/:id', updateTransactions)

// Delete a transaction
router.delete('/:userId/transactions/:transactionId', deleteTransaction);

// Update a transaction
router.put('/:userId/transactions/:transactionId', updateTransaction);


module.exports = router