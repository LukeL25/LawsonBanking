import { createContext, useReducer } from 'react'

export const BankingContext = createContext()

export const bankingReducer = (state, action) => {
    switch(action.type) {
        case 'SET_TRANSACTIONS':
            return {
                transactions: action.payload
            }
        case 'CREATE_WORKOUT':
            return {
                workouts: [action.payload, ...state.workouts]
            }
        case 'DELETE_WORKOUT':
            return {
                workouts: state.workouts.filter((w) => w._id !== action.payload._id)
            }
        case 'UPDATE_WORKOUT':
            return state
        default:
            return state
    }
}

const TransactionsContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(bankingReducer, {
        workouts: null
    })

    return (
        <TransactionsContextProvider.Provider value={{...state, dispatch}}>
            { children }
        </TransactionsContextProvider.Provider>
    )
}

export default TransactionsContextProvider