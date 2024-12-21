import React from "react";
import withAuth from "../withAuth";
import { useNavigate } from "react-router-dom";

function StudentDash() {
    const navigate = useNavigate()

    const handleLogout = () => {
        navigate('/')
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('token_expiry')
    }

    return (
        <div className="student-cont">
            <button onClick={handleLogout}>Logout</button>
            <h1>Welcome Student</h1>
        </div>
    )
}

export default withAuth(StudentDash, 'student')