import React, { useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

function withAuth(WrappedComponent, requiredRole) {
    return function AuthorizedComponent(props) {
        const [isAuthorized, setIsAuthorized] = useState(false)
        const navigate = useNavigate()

        useEffect(() => {
            const token = localStorage.getItem('token')
            const role = localStorage.getItem('role')
            if (token && role === requiredRole) {
                setIsAuthorized(true)
            } else {
                navigate('/login-student', {state: {error: 'Unauthorized'}})
            }

        }, [navigate])

        return isAuthorized ? <WrappedComponent {...props} /> : null
    }
}

export default withAuth