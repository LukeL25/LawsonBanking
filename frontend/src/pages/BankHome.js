import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserAccount = () => {
    const [userData, setUserData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [newTransaction, setNewTransaction] = useState({ transDescription: '', amount: '', transType: 'credit' });
    const [editableTransaction, setEditableTransaction] = useState(null);
    const [isFilterModalOpen, setFilterModalOpen] = useState(false);
    const [isFilteredTransactionsOpen, setFilteredTransactionsOpen] = useState(false);
    const [lowerBound, setLowerBound] = useState('');
    const [upperBound, setUpperBound] = useState('');
    const [filteredTransactions, setFilteredTransactions] = useState([]);
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

    // Fetch transactions in the specified range
    const fetchTransactionsInRange = async () => {
        if (!lowerBound || !upperBound) {
            alert('Please enter both lower and upper bounds.');
            return;
        }
    
        try {
            const response = await axios.get(
                `http://localhost:4000/api/banking/transactions/range/${userId}`,
                {
                    params: { lowerBnd: lowerBound, upperBnd: upperBound }, // Pass bounds as query parameters
                }
            );
            console.log(response.data);
            // setFilteredTransactions(response.data);
            // setFilteredTransactionsOpen(true); // Open the filtered transactions modal
            // setFilterModalOpen(false); // Close the input modal
        } catch (error) {
            console.error('Error fetching transactions in range:', error);
        }
    };

    // Recalculate the balance based on transactions
    const recalculateBalance = (updatedTransactions) => {
        let newBalance = 0;
        updatedTransactions.forEach((transaction) => {
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
            const payload = {
                transactions: [newTransaction],
            };

            const response = await axios.put(`http://localhost:4000/api/banking/${userId}`, payload);
            const updatedTransactions = response.data.transactions;
            const newBalance = recalculateBalance(updatedTransactions);

            setTransactions(updatedTransactions);
            setUserData({ ...userData, transactions: updatedTransactions, balance: newBalance });
            setAddModalOpen(false);
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    };

    // Update a transaction
    const updateTransaction = async () => {
        try {
            // Send the updated transaction to the API
            const response = await axios.put(
                `http://localhost:4000/api/banking/${userId}/transactions/${editableTransaction._id}`,
                { transaction: editableTransaction }
            );

            const updatedTransactions = response.data.transactions;
            const newBalance = recalculateBalance(updatedTransactions);

            setTransactions(updatedTransactions);
            setUserData({ ...userData, transactions: updatedTransactions, balance: newBalance });

    
            // Close the edit modal
            setEditModalOpen(false);
            setEditableTransaction(null);
        } catch (error) {
            console.error('Error updating transaction:', error);
        }
    };
    

    // Toggle modal visibility
    const toggleModal = () => setModalOpen(!isModalOpen);
    const toggleAddModal = () => setAddModalOpen(!isAddModalOpen);
    const toggleEditModal = () => setEditModalOpen(!isEditModalOpen);

    // Handle input change for new transaction
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTransaction({
            ...newTransaction,
            [name]: name === 'amount' ? parseFloat(value) : value,
        });
    };

    // Handle input change for editable transaction
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditableTransaction({
            ...editableTransaction,
            [name]: name === 'amount' ? parseFloat(value) : value,
        });
    };

    // Open edit modal with selected transaction
    const editTransaction = (transaction) => {
        setEditableTransaction(transaction);
        setEditModalOpen(true);
    };

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
                    <button className="button" onClick={() => setFilterModalOpen(true)}>
                        Filter Transactions by Range
                    </button>
        

                    {/* Transaction list modal */}
                    {isModalOpen && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>User Transactions</h3>
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
                                            <button
                                                className="button edit-button"
                                                onClick={() => editTransaction(transaction)}
                                            >
                                                Edit
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <button className="button" onClick={toggleModal}>Close</button>
                            </div>
                        </div>
                    )}

                    {/* Add transaction modal */}
                    {isAddModalOpen && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>Add New Transaction</h3>
                                <form>
                                    <label>Description:</label>
                                    <input
                                        type="text"
                                        name="transName"
                                        value={newTransaction.transName}
                                        onChange={handleInputChange}
                                    />
                                    <label>Amount:</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={newTransaction.amount}
                                        onChange={handleInputChange}
                                    />
                                    <label>Type:</label>
                                    <select
                                        name="transType"
                                        value={newTransaction.transType}
                                        onChange={handleInputChange}
                                    >
                                        <option value="credit">Credit</option>
                                        <option value="debit">Debit</option>
                                    </select>
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

                    {/* Filter Transactions Modal */}
                    {isFilterModalOpen && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>Filter Transactions by Amount</h3>
                                <label>
                                    Lower Bound:
                                    <input
                                        type="number"
                                        value={lowerBound}
                                        onChange={(e) => setLowerBound(e.target.value)}
                                    />
                                </label>
                                <label>
                                    Upper Bound:
                                    <input
                                        type="number"
                                        value={upperBound}
                                        onChange={(e) => setUpperBound(e.target.value)}
                                    />
                                </label>
                                <button className="button" onClick={fetchTransactionsInRange}>
                                    Fetch Transactions
                                </button>
                                <button className="button" onClick={() => setFilterModalOpen(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Filtered Transactions Modal */}
                    {isFilteredTransactionsOpen && (
                        <div className="modal">
                            <div className="modal-content scrollable">
                                <h3>Filtered Transactions</h3>
                                {filteredTransactions.length > 0 ? (
                                    <ul>
                                        {filteredTransactions.map((transaction) => (
                                            <li key={transaction._id}>
                                                <p><strong>Description:</strong> {transaction.transName}</p>
                                                <p><strong>Amount:</strong> ${transaction.amount.toFixed(2)}</p>
                                                <p><strong>Type:</strong> {transaction.transType}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No transactions found in the specified range.</p>
                                )}
                                <button className="button" onClick={() => setFilteredTransactionsOpen(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Edit transaction modal */}
                    {isEditModalOpen && editableTransaction && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>Edit Transaction</h3>
                                <form>
                                    <label>Description:</label>
                                    <input
                                        type="text"
                                        name="transName"
                                        value={editableTransaction.transName}
                                        onChange={handleEditInputChange}
                                    />
                                    <label>Amount:</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={editableTransaction.amount}
                                        onChange={handleEditInputChange}
                                    />
                                    <label>Type:</label>
                                    <select
                                        name="transType"
                                        value={editableTransaction.transType}
                                        onChange={handleEditInputChange}
                                    >
                                        <option value="credit">Credit</option>
                                        <option value="debit">Debit</option>
                                    </select>
                                    <button type="button" className="button" onClick={updateTransaction}>
                                        Update Transaction
                                    </button>
                                    <button type="button" className="button" onClick={toggleEditModal}>
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
