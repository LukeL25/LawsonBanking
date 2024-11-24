const Banking = require('../models/bankingModel')
const mongoose = require('mongoose')
const { connectToDb } = require('../db');
const { ObjectId } = require('mongodb');
const { MongoClient } = require('mongodb');


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

        // Calculate the new balance
        const newBalance = user.balance - transaction.amount;

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


// Filters transactions by amount bounds
const BoundedTransactions = async (req, res) => {
    const { userId } = req.params;
    const { lowerBnd, upperBnd } = req.query; // Extract from query parameters

    console.log('Bounds:', lowerBnd, upperBnd);

    chillGuy();

    try {
        const database = await connectToDb();
        const usersCollection = database.collection('bankings');

        const lowerBound = lowerBnd ? parseFloat(lowerBnd) : -1;
        const upperBound = upperBnd ? parseFloat(upperBnd) : -1;

        let result;

        // Check database connection
        await client.connect();
        console.log("Connected to database");


        if (lowerBound === -1) {
            console.log("1")
            // No lower bound specified
            result = await usersCollection.aggregate([
                { $match: { _id: ObjectId(userId) } },
                { $unwind: '$transactions' },
                { $match: { 'transactions.amount': { $lt: upperBound } } },
                { $project: { transactions: 1 } }
            ]).toArray();
        } else if (upperBound === -1) {
            console.log("2")
            // No upper bound specified
            result = await usersCollection.aggregate([
                { $match: { _id: ObjectId(userId) } },
                { $unwind: '$transactions' },
                { $match: { 'transactions.amount': { $gt: lowerBound } } },
                { $project: { transactions: 1 } }
            ]).toArray();
        } else {
            console.log("3")
            // Both bounds are specified
            result = await usersCollection.aggregate([
                { $match: { _id: new ObjectId(userId) } },
                { $unwind: '$transactions' },
                { $match: { 'transactions.amount': { $gt: lowerBound, $lt: upperBound } } },
                { $project: { transactions: 1 } }
            ]).toArray();
            console.log("hi!")
        }

        console.log(result)

        if (result.length === 0) {
            console.log("we here error")
            return res.status(404).json({ message: 'No transactions found within range' });
        }

        const highValueTransactions = result.map((item) => item.transactions);
        res.status(200).json(highValueTransactions);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// update/create new user transaction
// TODO rename this
const getBoundedTransactions = async (req, res) => {
    const client = new MongoClient(process.env.MONGO_URI);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        const pipeline = [
            {
            $unwind: {
                path: "$transactions",  // Flatten the transactions array
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
                from: "bankings",  // Assuming the collection where the user data is stored is called "users"
                localField: "_id",  // Field from the aggregation to match on
                foreignField: "_id",  // Field in the users collection to match on
                as: "userDetails"  // Alias for the joined data
            }
            },
            {
            $unwind: "$userDetails"  // Unwind the userDetails array to flatten it
            },
            {
            $project: {
                _id: 1,  // Keep the _id field
                name: "$userDetails.name",  // Include the name from userDetails
                averageTransactionAmount: 1  // Include the averageTransactionAmount from the previous stage
            }
            }
        ];

        const userCursor = client.db("test").collection("bankings").aggregate(pipeline);

        // await userCursor.forEach(user => {
        //     console.log(`${user._id}: ${user.averageTransactionAmount}, ${user.name}`);
        // });

        // Collect all results
        const results = [];
        await userCursor.forEach(user => {
            results.push({
                _id: user._id,
                name: user.name,
                averageTransactionAmount: {
                        $ifNull: ["$averageTransactionAmount", 0]  // Handle undefined averageTransactionAmount by setting it to 0
                    }  
            });
        });

        // Send the results as a JSON response
        res.status(200).json(results);

    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
};




// Filters transactions by type (debit/credt)




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