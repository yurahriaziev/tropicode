import React, { useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

function withAuth(WrappedComponent, requiredRole) {
    return function AuthorizedComponent(props) {
        const [isAuthorized, setIsAuthorized] = useState(false)
        const navigate = useNavigate()

        useEffect(() => {
            const token = localStorage.getItem('token')
            const role = localStorage.getItem('role')
            const tokenExp = localStorage.getItem('token_expiry')
            if (token && role === requiredRole && tokenExp && Date.now() < parseInt(tokenExp)) {
                setIsAuthorized(true)
            } else {
                navigate('/login-student', {state: {error: 'Unauthorized'}})
                localStorage.removeItem('token')
                localStorage.removeItem('role')
                localStorage.removeItem('token_expiry')
            }

        }, [navigate])

        return isAuthorized ? <WrappedComponent {...props} /> : null
    }
}

export default withAuth