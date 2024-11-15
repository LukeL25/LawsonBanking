import { useEffect} from "react"
import { useTransactionContext } from "../hooks/useTransactionContext"

// components
import TransactionDetails from '../components/TransactionDetails'
import WorkoutForm from "../components/WorkoutForm"

const Home = () => {
    const { transactions, dispatch } = useTransactionContext()

    useEffect( () => {
        const fetchWorkouts = async () => {
            const response = await fetch('/api/banking/673756e623a73f19355bacf5')
            const json = await response.json()

            if (response.ok) {
                dispatch({type: 'SET_TRANSACTIONS', payload: json})
            }
        }

        fetchWorkouts()
    }, [])

    return (
        <div className="home">
            <div className="workouts">
                {transactions && transactions.map((transaction) => (
                    <TransactionDetails key={transactions._id} transaction = {transaction}/>
                ))}
            </div>
            <WorkoutForm/>
        </div>
    )
}

export default Home