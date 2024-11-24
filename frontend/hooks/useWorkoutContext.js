import { WorkoutsContext } from "../src/context/WorkoutsContext"
import { useContext } from 'react'

export const useWorkoutsContext = () => {
    const context = useContext(WorkoutsContext)

    if (!context) {
        throw Error("useWorkoutContext mus be used inside a WorkoutsContextProvider")
    }

    return context
}