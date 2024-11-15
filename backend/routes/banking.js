const express = require('express')
const {
    createAccount,
    getAccounts,
    getAccount,
    deleteAccount,
    updateAccount
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

module.exports = router