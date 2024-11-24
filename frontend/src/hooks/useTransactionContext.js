import { BankingContext } from "../context/BankingContext"
import { useContext } from 'react'

export const useTransactionContext = () => {
    const context = useContext(BankingContext)

    if (!context) {
        throw Error("useTransactionContext must be used inside a TransactionContextProvider")
    }

    return context
}