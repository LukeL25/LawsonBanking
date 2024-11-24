const express = require('express')
const {
    createAccount,
    getAccounts,
    getAccount,
    deleteAccount,
    updateAccount,
    updateTransactions,
    deleteTransaction,
    updateTransaction,
    getBoundedTransactions
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

// Filter by transaction size
router.get('/transactions/range/:userId', getBoundedTransactions);

// Filter by transaction type (credit/debit)



module.exports = router