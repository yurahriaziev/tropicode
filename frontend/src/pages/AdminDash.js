import React, { useEffect, useState } from "react";
import withAuth from "../withAuth";
import NewTutorForm from "../components/NewTutorForm";
import { useNavigate } from "react-router-dom";

function AdminDash() {
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [addTutorForm, setAddTutorForm] = useState(false)
    const navigate = useNavigate()

    const handleAddTutorClick = (open) => {
        setAddTutorForm(open)
        if (open) setSuccess('')
    }

    const handleLogout = () => {
        navigate('/')
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('token_expiry')
    }

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess('')
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [success])

    return (
        <div className="admin-cont">
            {error && (
                <div style={{ fontWeight: 'bold', backgroundColor: 'red', color: 'white', padding: '10px', marginBottom: '10px' }}>
                    {error}
                </div>
            )}
            {success && (
                <div style={{ fontWeight: 'bold', backgroundColor: 'green', color: 'white', padding: '10px', marginBottom: '10px' }}>
                    {success}
                </div>
            )}
            <button onClick={handleLogout}>Logout</button>
            <h1>Welcome Admin</h1>
            <button onClick={() => handleAddTutorClick(true)}>Add a Tutor</button>
            {addTutorForm && (
                <NewTutorForm handleAddTutorClick={handleAddTutorClick} setError={setError} setSuccess={setSuccess}/>
            )}
        </div>
    )
}

export default withAuth(AdminDash, 'admin')