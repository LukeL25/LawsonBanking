import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserAccount = () => {
    const [userData, setUserData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [newTransaction, setNewTransaction] = useState({ transDescription: '', amount: '', transType: 'credit' });
    const userId = '673756e623a73f19355bacf5'; // Example user ID

    // Fetch user data from the API
    const fetchUserData = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/banking/${userId}`);
            setUserData(response.data);
            setTransactions(response.data.transactions);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    // Recalculate the balance based on transactions
    const recalculateBalance = (updatedTransactions) => {
        let newBalance = 0;
        updatedTransactions.forEach(transaction => {
            if (transaction.transType === 'debit') {
                newBalance -= transaction.amount;
            } else if (transaction.transType === 'credit') {
                newBalance += transaction.amount;
            }
        });
        return newBalance;
    };

    // Delete a transaction
    const deleteTransaction = async (transactionId) => {
        try {
            await axios.delete(`http://localhost:4000/api/banking/${userId}/transactions/${transactionId}`);
            const updatedTransactions = transactions.filter((t) => t._id !== transactionId);
            const newBalance = recalculateBalance(updatedTransactions);
            setTransactions(updatedTransactions);
            setUserData({ ...userData, transactions: updatedTransactions, balance: newBalance });
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    // Add a new transaction
    const addTransaction = async () => {
        try {
            // Prepare the payload with the new transaction
            const payload = {
                transactions: [newTransaction],
            };

            // Send PUT request to update the transactions field of the user account
            const response = await axios.put(`http://localhost:4000/api/banking/${userId}`, payload);
            const updatedTransactions = response.data.transactions;

            // Calculate the new balance and update state
            const newBalance = recalculateBalance(updatedTransactions);
            setTransactions(updatedTransactions);
            setUserData({ ...userData, transactions: updatedTransactions, balance: newBalance });
            setAddModalOpen(false); // Close the add transaction modal
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    };

    // Toggle modal visibility
    const toggleModal = () => {
        setModalOpen(!isModalOpen);
    };

    // Toggle add transaction modal visibility
    const toggleAddModal = () => {
        setAddModalOpen(!isAddModalOpen);
    };

    // Handle input change for new transaction
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTransaction({
            ...newTransaction,
            [name]: name === 'amount' ? parseFloat(value) : value,
        });
    };

    // Fetch user data when the component loads
    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <div className="container">
            {userData ? (
                <>
                    <h2>User Account Information</h2>
                    <p><strong>Name:</strong> {userData.name}</p>
                    <p><strong>Balance:</strong> ${userData.balance.toFixed(2)}</p>

                    <button className="button" onClick={toggleModal}>
                        Show Transactions
                    </button>
                    <button className="button" onClick={toggleAddModal}>
                        Add Transaction
                    </button>

                    {/* Modal for displaying transactions */}
                    {isModalOpen && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>User Transactions</h3>
                                <div className="transactions-list-container">
                                    <ul>
                                        {transactions.map((transaction) => (
                                            <li key={transaction._id}>
                                                <p><strong>Description:</strong> {transaction.transName}</p>
                                                <p><strong>Amount:</strong> ${transaction.amount.toFixed(2)}</p>
                                                <p><strong>Type:</strong> {transaction.transType}</p>
                                                <button
                                                    className="button delete-button"
                                                    onClick={() => deleteTransaction(transaction._id)}
                                                >
                                                    Delete
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button className="button" onClick={toggleModal}>Close</button>
                            </div>
                        </div>
                    )}

                    {/* Modal for adding a new transaction */}
                    {isAddModalOpen && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>Add New Transaction</h3>
                                <form>
                                    <div>
                                        <label>Description:</label>
                                        <input
                                            type="text"
                                            name="transDescription"
                                            value={newTransaction.transDescription}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <label>Amount:</label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={newTransaction.amount}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <label>Type:</label>
                                        <select
                                            name="transType"
                                            value={newTransaction.transType}
                                            onChange={handleInputChange}
                                        >
                                            <option value="credit">Credit</option>
                                            <option value="debit">Debit</option>
                                        </select>
                                    </div>
                                    <button type="button" className="button" onClick={addTransaction}>
                                        Save Transaction
                                    </button>
                                    <button type="button" className="button" onClick={toggleAddModal}>
                                        Cancel
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
};

export default UserAccount;
