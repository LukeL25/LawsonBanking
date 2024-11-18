import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserAccount = () => {
    const [userData, setUserData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
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

    // Recalculate the balance based on remaining transactions
    const recalculateBalance = (updatedTransactions) => {
        const newBalance = updatedTransactions.reduce((acc, transaction) => {
            return transaction.transType === 'credit'
                ? acc + transaction.amount
                : acc - transaction.amount;
        }, 0);
        return newBalance;
    };

    // Delete a transaction
    const deleteTransaction = async (transactionId) => {
        try {
            await axios.delete(`http://localhost:4000/api/banking/${userId}/transactions/${transactionId}`);
            // Filter out the deleted transaction
            const updatedTransactions = transactions.filter((t) => t._id !== transactionId);

            // Recalculate the balance
            const newBalance = recalculateBalance(updatedTransactions);

            // Update transactions and user data state
            setTransactions(updatedTransactions);
            setUserData({ ...userData, transactions: updatedTransactions, balance: newBalance });
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    // Toggle modal visibility
    const toggleModal = () => {
        setModalOpen(!isModalOpen);
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
                    <p><strong>Balance:</strong> ${userData.balance}</p>

                    <button className="button" onClick={toggleModal}>
                        Show Transactions
                    </button>

                    {/* Modal for displaying transactions */}
                    {isModalOpen && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>User Transactions</h3>
                                <ul>
                                    {transactions.map((transaction) => (
                                        <li key={transaction._id}>
                                            <p><strong>Description:</strong> {transaction.transDescription}</p>
                                            <p><strong>Amount:</strong> ${transaction.amount}</p>
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
                                <button className="button" onClick={toggleModal}>Close</button>
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
