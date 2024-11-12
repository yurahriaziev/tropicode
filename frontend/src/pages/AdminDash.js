import React, { useState } from "react";
import withAuth from "../withAuth";
import NewTutorForm from "../components/NewTutorForm";

function AdminDash() {
    const [error, setError] = useState('')
    const [addTutorForm, setAddTutorForm] = useState(false)

    const handleAddTutorClick = (open) => {
        setAddTutorForm(open)
    }
    return (
        <div className="admin-cont">
            {error && (
                <div style={{ fontWeight: 'bold', backgroundColor: 'red', color: 'white', padding: '10px', marginBottom: '10px' }}>
                    {error}
                </div>
            )}
            <h1>Welcome Admin</h1>
            <button onClick={() => handleAddTutorClick(true)}>Add a Tutor</button>
            {addTutorForm && (
                <NewTutorForm handleAddTutorClick={handleAddTutorClick} setError={setError}/>
            )}
        </div>
    )
}

export default withAuth(AdminDash, 'admin')