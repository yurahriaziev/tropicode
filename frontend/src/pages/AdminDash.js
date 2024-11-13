import React, { useState } from "react";
import withAuth from "../withAuth";
import NewTutorForm from "../components/NewTutorForm";
import { useNavigate } from "react-router-dom";

function AdminDash() {
    const [error, setError] = useState('')
    const [addTutorForm, setAddTutorForm] = useState(false)
    const navigate = useNavigate()

    const handleAddTutorClick = (open) => {
        setAddTutorForm(open)
    }

    const handleLogout = () => {
        navigate('/')
        localStorage.removeItem('toke')
        localStorage.removeItem('role')
        localStorage.removeItem('token_expiry')
    }
    return (
        <div className="admin-cont">
            {error && (
                <div style={{ fontWeight: 'bold', backgroundColor: 'red', color: 'white', padding: '10px', marginBottom: '10px' }}>
                    {error}
                </div>
            )}
            <button onClick={handleLogout}>Logout</button>
            <h1>Welcome Admin</h1>
            <button onClick={() => handleAddTutorClick(true)}>Add a Tutor</button>
            {addTutorForm && (
                <NewTutorForm handleAddTutorClick={handleAddTutorClick} setError={setError}/>
            )}
        </div>
    )
}

export default withAuth(AdminDash, 'admin')