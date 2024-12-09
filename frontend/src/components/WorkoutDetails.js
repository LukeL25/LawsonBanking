import { useWorkoutsContext } from "../hooks/useWorkoutContext"

const WorkoutDetails = ({workout}) => {
    const { dispatch } = useWorkoutsContext()

    const handleDelete = async () => {
        const response = await fetch('/api/workouts/' + workout._id, {
            method: 'DELETE'
        })
        const json = await response.json()

        if (response.ok) {
            dispatch({type: 'DELETE_WORKOUT', payload: json})
        }
    }

    return (
        <div className="workout-details">
            <h4>{workout.title}</h4>
            <p><strong>Dollar Amount: </strong>{workout.load}</p>
            <p><strong>Cents: </strong>{workout.reps}</p>
            <p><strong>Timestamp: </strong>{workout.createdAt}</p>
            <p><strong>Workout ID: </strong>{workout._id}</p>
            <span onClick={handleDelete}>delete</span>
        </div>
    )
}

export default WorkoutDetails