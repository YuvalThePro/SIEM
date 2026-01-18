import { useContext, useEffect } from "react"
import { AuthContext } from "../App.jsx"

const ProtectedRoute = ({ children, navigate }) => {
    const { user } = useContext(AuthContext)

    useEffect(() => {
        if (!user) {
            navigate('/login', { replace: true })
        }
    }, [user, navigate])

    if (!user) {
        return null
    }

    return children
}

export default ProtectedRoute
