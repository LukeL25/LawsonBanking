import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserAccount = () => {


    const [userData, setUserData] = useState(null);
    const [transactions, setTransactions] = useState([]);

    const [reportedUsers, setReportedUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState([]); // Default to the first user
    var selectedUser = reportedUsers.find((user) => user._id === selectedUserId);

    const [isModalOpen, setModalOpen] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isAddAccountOpen, setAddAccountModal] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [newTransaction, setNewTransaction] = useState({ transDescription: '', amount: '', transType: 'credit' });
    const [newUser, setNewUser] = useState({ name: '', balance: 0, transactions: []})
    const [editableTransaction, setEditableTransaction] = useState(null);
    const [isFilterModalOpen, setFilterModalOpen] = useState(false);
    
    const [allUsers, setAllUsers] = useState([]); // All users for dropdown
    const [userId, setUserId] = useState('673756e623a73f19355bacf5'); // Default user ID
    const [isUserSelectModalOpen, setUserSelectModalOpen] = useState(false);

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

    // Fetch all users (for dropdown)
    const fetchAllUsers = async () => {
        try {
        const response = await axios.get('http://localhost:4000/api/banking/'); // Replace with actual endpoint
        setAllUsers(response.data);
        } catch (error) {
        console.error('Error fetching all users:', error);
        }
    };

    // Fetch transactions in the specified range
    const fetchTransactionsInRange = async () => {    
        try {
            const response = await axios.get(`http://localhost:4000/api/banking/transactions/range/${userId}`);
            console.log(response.data);
            console.log(response.data[1].averageTransactionAmount)
            setReportedUsers(response.data);
            setSelectedUserId(response.data[0]._id)
            selectedUser = reportedUsers.find((user) => user._id === selectedUserId)

            console.log(reportedUsers[0]);
            console.log(reportedUsers[1]);
            console.log(reportedUsers[2]);
            toggleReportModal();
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

    // Add a new user account
    const addUser = async () => {
        try {
            const payload = {
                name: newUser.name,
                balance: parseFloat(newUser.balance) || 0,
                transactions: newUser.transactions || [], 
            };
    
            console.log("Payload being sent:", payload);
    
            const response = await axios.post(`http://localhost:4000/api/banking/`, payload, {
                headers: { "Content-Type": "application/json" },
            });
            console.log("User added successfully:", response.data);
    
            // Reset newUser state
            setNewUser({ name: '', balance: 0, transactions: [] });
            fetchAllUsers()
            setAddAccountModal(false);
        } catch (error) {
            console.error("Error adding new user:", error.response?.data || error.message);
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
    const toggleAddAccountModal = () => setAddAccountModal(!isAddAccountOpen);
    const toggleEditModal = () => setEditModalOpen(!isEditModalOpen);
    const toggleReportModal = () => setFilterModalOpen(!isFilterModalOpen)
    const toggleUserSelectModal = () => setUserSelectModalOpen(!isUserSelectModalOpen);

    // Handle input change for new transaction
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTransaction({
            ...newTransaction,
            [name]: name === 'amount' ? parseFloat(value) : value,
        });
    };

    // Handle input change for new account
    const handleAccountInputChange = (e) => {
        const { name, value } = e.target;
    
        setNewUser((prevState) => ({
            ...prevState,
            [name]: value, // Dynamically update the field by its name
        }));
    };
    
    

    // Handle input change for editable transaction
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditableTransaction({
            ...editableTransaction,
            [name]: name === 'amount' ? parseFloat(value) : value,
        });
    };

    // Handle user selection
    const handleUserChange = (e) => {
        console.log(e.target.value)
        setUserId(e.target.value); // Update userId
    };

    const confirmUserSelection = () => {
        setUserSelectModalOpen(false); // Close the modal
        fetchUserData();
      };

    // Open edit modal with selected transaction
    const editTransaction = (transaction) => {
        setEditableTransaction(transaction);
        setEditModalOpen(true);
    };

    useEffect(() => {
        fetchUserData();
    }, [userId]);

    // Fetch all users on initial load
    useEffect(() => {
        fetchAllUsers();
    }, []);

    return (
        <div className="container">
            {userData ? (
                <>
                    <h2>User Account Information</h2>
                    <p><strong>Name:</strong> {userData.name}</p>
                    <p>
                    <strong>Balance:</strong> 
                    {userData.balance !== undefined 
                        ? `$${userData.balance.toFixed(2)}` 
                        : "Balance not available"}
                    </p>
                    <button className="button" onClick={toggleAddAccountModal}>
                        Add User
                    </button>
                    <button className="button" onClick={toggleUserSelectModal}>
                        Switch User
                    </button>
                    <button className="button" onClick={toggleModal}>
                        Show Transactions
                    </button>
                    <button className="button" onClick={toggleAddModal}>
                        Add Transaction
                    </button>
                    <button className="button" onClick={() => fetchTransactionsInRange()}>
                        User Transaction Report
                    </button>

                    {isUserSelectModalOpen && (
                    <div className="modal-overlay">
                    <div className="modal-container">
                        <h2>Select User</h2>
                        <select
                        value={userId}
                        onChange={handleUserChange}
                        className="user-dropdown"
                        >
                        {allUsers.map((user) => (
                            <option key={user._id} value={user._id}>
                            {user.name}
                            </option>
                        ))}
                        </select>
                        <div className="modal-actions">
                        <button className="button" onClick={confirmUserSelection}>
                            Confirm
                        </button>
                        <button className="button" onClick={toggleUserSelectModal}>
                            Cancel
                        </button>
                        </div>
                    </div>
                    </div>
                )}

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

                    {/* Add account modal */}
                    {isAddAccountOpen && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>Add New Account</h3>
                                <form>
                                    <label>Name of User:</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newUser.name}
                                        onChange={handleAccountInputChange}
                                    />
                                    <button type="button" className="button" onClick={addUser}>
                                        Add User
                                    </button>
                                    <button type="button" className="button" onClick={toggleAddAccountModal}>
                                        Cancel
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Filter Transactions Modal */}
                    {isFilterModalOpen && (
                        <div className="modal-overlay">
                            <div className="modal-container">
                                <h2>User Report</h2>

                                {/* Dropdown for user selection */}
                                <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="user-dropdown"
                                >
                                {reportedUsers.map((user) => (
                                    <option key={user._id} value={user._id}>
                                    {user.name}
                                    </option>
                                ))}
                                </select>

                                {/* Display selected user details */}
                                <div className="user-details">
                                <h3>{selectedUser.name}</h3>
                                <p>
                                    Average Transaction Amount:{" "}
                                    {selectedUser.averageTransactionAmount !== null
                                    ? `$${selectedUser.averageTransactionAmount}`
                                    : "No Transactions"}
                                </p>
                                <p>
                                    Average Credit Transaction Amount:{" "}
                                    {selectedUser.creditAverage !== null
                                    ? `$${selectedUser.creditAverage}`
                                    : "$0"}
                                </p>
                                <p>
                                    Average Credit Transaction Amount:{" "}
                                    {selectedUser.debitAverage !== null
                                    ? `$${selectedUser.debitAverage}`
                                    : "$0"}
                                </p>
                                </div>

                                {/* Close button */}
                                <button onClick={toggleReportModal} className="close-modal-button">
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
