const Banking = require('../models/bankingModel')
const mongoose = require('mongoose')
const { connectToDb } = require('../db');
const { ObjectId } = require('mongodb');
const { MongoClient } = require('mongodb');


// MongoDb Prepared Statements 
const averageAmount = [
    {
        $unwind: {
            path: "$transactions",
            preserveNullAndEmptyArrays: true
        }
        },
        {
        $group: {
            _id: "$_id",  // Group by user _id
            averageTransactionAmount: { $avg: "$transactions.amount" }  // Calculate the average of the transaction amounts
        }
        },
        {
        $lookup: {
            from: "bankings",  
            localField: "_id", 
            foreignField: "_id",
            as: "userDetails"  
        }
        },
        {
        $unwind: "$userDetails" 
        },
        {
        $project: {
            _id: 1,  // Keep the _id field
            name: "$userDetails.name",  // Include the name from userDetails
            averageTransactionAmount: 1  // Include the averageTransactionAmount from the previous stage
        }
    }
];


const averageCreditDebitAmount = [
    {
        $unwind: {
        path: "$transactions",
        preserveNullAndEmptyArrays: true,
        },
    },
    {
        $group: {
        _id: {
            userId: "$_id", // Group by user ID
            transType: "$transactions.transType", // Group by transaction type (credit/debit)
        },
        averageTransactionAmount: { $avg: "$transactions.amount" }, // Calculate average for each transType
        },
    },
    {
        $group: {
        _id: "$_id.userId", // Regroup by user ID
        creditAverage: {
            $max: {
            $cond: [{ $eq: ["$_id.transType", "credit"] }, "$averageTransactionAmount", null],
            },
        },
        debitAverage: {
            $max: {
            $cond: [{ $eq: ["$_id.transType", "debit"] }, "$averageTransactionAmount", null],
            },
        },
        },
    },
    {
        $lookup: {
        from: "bankings", 
        localField: "_id",
        foreignField: "_id",
        as: "userDetails",
        },
    },
    {
        $unwind: "$userDetails",
    },
    {
        $project: {
        _id: 1, 
        name: "$userDetails.name",
        creditAverage: 1,
        debitAverage: 1,
        },
    },      
];

// If you have time implement this, otherwise just skip
const numTransactions = [
    [
        {
            '$unwind': {
                'path': '$transactions', 
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$group': {
                '_id': {
                    'userId': '$_id', 
                    'transType': '$transactions.transType'
                }, 
                'count': {
                    '$sum': 1
                }
            }
        }, {
            '$group': {
                '_id': '$_id.userId', 
                'creditCount': {
                    '$sum': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$_id.transType', 'credit'
                                ]
                            }, '$count', 0
                        ]
                    }
                }, 
                'debitCount': {
                    '$sum': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$_id.transType', 'debit'
                                ]
                            }, '$count', 0
                        ]
                    }
                }, 
                'totalTransactionCount': {
                    '$sum': '$count'
                }
            }
        }, {
            '$lookup': {
                'from': 'bankings', 
                'localField': '_id', 
                'foreignField': '_id', 
                'as': 'userDetails'
            }
        }, {
            '$unwind': {
                'path': '$userDetails'
            }
        }, {
            '$project': {
                '_id': 1, 
                'name': '$userDetails.name', 
                'creditCount': 1, 
                'debitCount': 1, 
                'totalTransactionCount': 1
            }
        }
    ]
];


// get all account transactions
const getAccounts = async (req, res) => {
    console.log("here!")
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

// update/create new user transaction
const updateTransactions = async (req, res) => {
    const { id } = req.params;
    const { transactions } = req.body;

    try {
        // Fetch the current user document
        const user = await Banking.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Calculate the new balance based on the incoming transactions
        let newBalance = user.balance;
        transactions.forEach(transaction => {
            if (transaction.transType === 'debit') {
                newBalance -= transaction.amount;
            } else if (transaction.transType === 'credit') {
                newBalance += transaction.amount;
            }
        });

        // Append the new transactions and update the balance
        const updatedUser = await Banking.findByIdAndUpdate(
            id,
            {
                $push: { transactions: { $each: transactions } },
                $set: { balance: newBalance }
            },
            { new: true } // Return the updated document
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Deletes a transaction
const deleteTransaction = async (req, res) => {
    const { userId, transactionId } = req.params;

    try {
        // Fetch the user document first
        const user = await Banking.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the transaction to delete
        const transaction = user.transactions.find(
            (trans) => trans._id.toString() === transactionId
        );

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        let newBalance;

        // Calculate the new balance
        if (transaction.transType == "credit") {
            newBalance = user.balance - transaction.amount;
        } else {
            newBalance = user.balance + transaction.amount;
        }

        // Remove the transaction using $pull
        const updatedUser = await Banking.findByIdAndUpdate(
            userId,
            {
                $pull: { transactions: { _id: transactionId } },
                $set: { balance: newBalance },
            },
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// updates a single transaction
const updateTransaction = async (req, res) => {
    const { userId, transactionId } = req.params;
    const { transName, amount, transType } = req.body.transaction; // Extract transaction data from the request body

    try {
        // Fetch the user document
        const user = await Banking.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the transaction to update
        const transaction = user.transactions.find(
            (trans) => trans._id.toString() === transactionId
        );

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Recalculate the balance
        const oldAmount = transaction.amount;
        const newBalance = 
            transType === "credit" 
                ? user.balance - oldAmount + amount 
                : user.balance + oldAmount - amount;

        // Update the transaction within the transactions array
        const updatedUser = await Banking.findOneAndUpdate(
            { _id: userId, 'transactions._id': transactionId }, // Match the user and the specific transaction
            {
                $set: {
                    'transactions.$.transName': transName,
                    'transactions.$.amount': amount,
                    'transactions.$.transType': transType,
                    balance: newBalance,
                },
            },
            { new: true } // Return the updated document
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// update/create new user transaction
// TODO rename this, mayube add something to count transactions
const getBoundedTransactions = async (req, res) => {
    const client = new MongoClient(process.env.MONGO_URI);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        const userCursor = client.db("test").collection("bankings").aggregate(averageAmount);
        const userCursor2 = client.db("test").collection("bankings").aggregate(averageCreditDebitAmount);

        // Fetch results from both cursors
        const [users1, users2] = await Promise.all([
            userCursor.toArray(),
            userCursor2.toArray(),
        ]);

        // Collect all results
        const results = [];

        // Process both user arrays
        users1.forEach(user1 => {
            const matchingUser = users2.find(user2 => user2.name === user1.name);
            results.push({
                _id: user1._id,
                name: user1.name,
                averageTransactionAmount: user1.averageTransactionAmount,
                creditAverage: matchingUser?.creditAverage || null,
                debitAverage: matchingUser?.debitAverage || null,
            });
        });

        // Add any users from users2 that aren't in users1
        users2.forEach(user2 => {
            if (!results.find(result => result.name=== user2.name)) {
                results.push({
                    _id: user2._id,
                    name: null,
                    averageTransactionAmount: null,
                    creditAverage: user2.creditAverage,
                    debitAverage: user2.debitAverage,
                });
            }
        });

        console.log(results)

        // Send the results as a JSON response
        res.status(200).json(results);

    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
};


module.exports = {
    getAccounts,
    getAccount,
    createAccount,
    deleteAccount,
    updateAccount,
    updateTransactions,
    deleteTransaction,
    updateTransaction,
    getBoundedTransactions
}