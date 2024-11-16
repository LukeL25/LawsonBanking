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
            console.log("here!")
            const response = await axios.get(`http://localhost:4000/api/banking/${userId}`);
            console.log(response.data)
            setUserData(response.data);
            setTransactions(response.data.transactions);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    // Toggle modal visibility
    const toggleModal = () => {
        setModalOpen(!isModalOpen);
    };

    // Fetch user data when the component loads
    useEffect(() => {
        fetchUserData();
        console.log("here!")
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
