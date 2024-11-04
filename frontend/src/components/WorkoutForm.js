import { useState } from "react"
import { useWorkoutsContext } from "../hooks/useWorkoutContext"

const WorkoutForm = () => {
    const { dispatch } = useWorkoutsContext()
    const [title, setTitle] = useState('')
    const [load, setLoad] = useState('')
    const [reps, setReps] = useState('')
    const [id, setId] = useState('')
    const [error, setError] = useState(null)


    const handleGenerateReport = () => {
        console.log('Generating report...')
        // Add report generation logic here
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const workout = {title, load, reps}

        const response = await fetch('/api/workouts', {
            method: 'POST',
            body: JSON.stringify(workout),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const json = await response.json()

        if (!response.ok) {
            setError(json.error)
        }
        if (response.ok) {
            setTitle('')
            setLoad('')
            setReps('')
            setError(null)
            console.log('new workout added')
            dispatch({type: 'CREATE_WORKOUT', payload: json})
        }
    }

    const handleEdit = async (e) => {
        e.preventDefault()

        const workout = {title, load, reps}

        const response = await fetch('/api/workouts' + '/' + id, {
            method: 'PATCH',
            body: JSON.stringify(workout),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const json = await response.json()

        if (!response.ok) {
            setError(json.error)
        }
        if (response.ok) {
            setTitle('')
            setLoad('')
            setReps('')
            setId('')
            setError(null)
            console.log('workout updated')
            dispatch({type: 'UPDATE_WORKOUT', payload: json})
        }
    }

    return (
        <form className="create" onSubmit={handleSubmit}>
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

            <label>ID:</label>
            <input
                type="text"
                onChange={(e) => setId(e.target.value)}
            />

            <button type="submit">Add Transaction</button>
            <button type="button" onClick={handleEdit}>Edit Transaction</button>
            <button type="button" onClick={handleGenerateReport}>Generate Report</button>
            {error && <div className="error">{error}</div>}
        </form>
    )
}

export default WorkoutForm
