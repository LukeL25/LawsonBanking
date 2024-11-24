const { MongoClient } = require('mongodb');

let client;
let db;

const connectToDb = async () => {
    if (db) return db; // Reuse existing connection

    try {
        client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        db = client.db('test');
        console.log('Connected to MongoDB');
        return db;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
        throw error;
    }
};

const closeDb = async () => {
    if (client) {
        await client.close();
        console.log('MongoDB connection closed');
    }
};

module.exports = { connectToDb, closeDb };
