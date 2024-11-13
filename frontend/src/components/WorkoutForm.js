import { useState } from "react";
import { useWorkoutsContext } from "../hooks/useWorkoutContext";

const WorkoutForm = () => {
    const { dispatch } = useWorkoutsContext();
    const [title, setTitle] = useState('');
    const [load, setLoad] = useState('');
    const [reps, setReps] = useState('');
    const [id, setId] = useState('');
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            setIsModalOpen(false);
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
            console.log('workout updated');
            dispatch({ type: 'UPDATE_WORKOUT', payload: json });
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="form-container">
            <div className="button-group-vertical">
                <button className="action-button" type="button" onClick={openModal}>
                    Add Transaction
                </button>
                <button className="action-button" type="button" onClick={handleEdit}>
                    Edit Transaction
                </button>
                <button className="action-button" type="button" onClick={handleGenerateReport}>
                    Generate Report
                </button>
            </div>

            {isModalOpen && (
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
                        <button type="button" onClick={closeModal}>
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
