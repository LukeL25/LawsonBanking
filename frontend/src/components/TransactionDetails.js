import { useTransactionContext } from "../hooks/useTransactionContext"

const WorkoutDetails = ({transaction}) => {
    const { dispatch } = useTransactionContext()

    const handleDelete = async () => {
        const response = await fetch('/api/workouts/' + transaction._id, {
            method: 'DELETE'
        })
        const json = await response.json()

        if (response.ok) {
            dispatch({type: 'DELETE_WORKOUT', payload: json})
        }
    }

    return (
        <div className="workout-details">
            <h4>{transaction.transName}</h4>
            <p><strong>Amount: </strong>{transaction.amount}</p>
            <p><strong>Transaction Type: </strong>{transaction.transType}</p>
            <p><strong>Timestamp: </strong>{transaction.createdAt}</p>
            <p><strong>Transaction ID: </strong>{transaction._id}</p>
            <span onClick={handleDelete}>delete</span>
        </div>
    )
}

export default WorkoutDetails