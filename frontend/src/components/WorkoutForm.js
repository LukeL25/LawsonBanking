import { useState } from "react";
import { useWorkoutsContext } from "../hooks/useWorkoutContext";

const WorkoutForm = () => {
    const { dispatch } = useWorkoutsContext();
    const [title, setTitle] = useState('');
    const [load, setLoad] = useState('');
    const [reps, setReps] = useState('');
    const [id, setId] = useState('');
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleGenerateReport = () => {
        console.log('Generating report...');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const workout = { title, load, reps };

        const response = await fetch('/api/workouts', {
            method: 'POST',
            body: JSON.stringify(workout),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const json = await response.json();

        if (!response.ok) {
            setError(json.error);
        }
        if (response.ok) {
            setTitle('');
            setLoad('');
            setReps('');
            setError(null);
            setIsAddModalOpen(false);
            console.log('new workout added');
            dispatch({ type: 'CREATE_WORKOUT', payload: json });
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();

        const workout = { title, load, reps };

        const response = await fetch('/api/workouts/' + id, {
            method: 'PATCH',
            body: JSON.stringify(workout),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const json = await response.json();

        if (!response.ok) {
            setError(json.error);
        }
        if (response.ok) {
            setTitle('');
            setLoad('');
            setReps('');
            setId('');
            setError(null);
            setIsEditModalOpen(false);
            console.log('workout updated');
            dispatch({ type: 'UPDATE_WORKOUT', payload: json });
        }
    };

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);

    const openEditModal = () => setIsEditModalOpen(true);
    const closeEditModal = () => setIsEditModalOpen(false);

    return (
        <div className="form-container">
            <div className="button-group-vertical">
                <button className="action-button" type="button" onClick={openAddModal}>
                    Add Transaction
                </button>
                <button className="action-button" type="button" onClick={openEditModal}>
                    Edit Transaction
                </button>
                <button className="action-button" type="button" onClick={handleGenerateReport}>
                    Generate Report
                </button>
            </div>

            {/* Add Transaction Modal */}
            {isAddModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Add a New Transaction</h3>

                        <label>Transaction Title:</label>
                        <input
                            type="text"
                            onChange={(e) => setTitle(e.target.value)}
                            value={title}
                        />

                        <label>Dollar Amount:</label>
                        <input
                            type="number"
                            onChange={(e) => setLoad(e.target.value)}
                            value={load}
                        />

                        <label>Cents:</label>
                        <input
                            type="number"
                            onChange={(e) => setReps(e.target.value)}
                            value={reps}
                        />

                        <button type="button" onClick={handleSubmit}>
                            Submit
                        </button>
                        <button type="button" onClick={closeAddModal}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Transaction Modal */}
            {isEditModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Edit Transaction</h3>

                        <label>Transaction ID:</label>
                        <input
                            type="text"
                            onChange={(e) => setId(e.target.value)}
                            value={id}
                        />

                        <label>Transaction Title:</label>
                        <input
                            type="text"
                            onChange={(e) => setTitle(e.target.value)}
                            value={title}
                        />

                        <label>Dollar Amount:</label>
                        <input
                            type="number"
                            onChange={(e) => setLoad(e.target.value)}
                            value={load}
                        />

                        <label>Cents:</label>
                        <input
                            type="number"
                            onChange={(e) => setReps(e.target.value)}
                            value={reps}
                        />

                        <button type="button" onClick={handleEdit}>
                            Submit
                        </button>
                        <button type="button" onClick={closeEditModal}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {error && <div className="error">{error}</div>}
        </div>
    );
};

export default WorkoutForm;
