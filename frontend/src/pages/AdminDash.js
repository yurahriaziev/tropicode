import React, { useEffect, useState } from "react";
import withAuth from "../withAuth";
import NewTutorForm from "../components/NewTutorForm";
import { useNavigate } from "react-router-dom";
import AdminTutorInfo from "../components/AdminTutorInfo";

function AdminDash() {
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [addTutorForm, setAddTutorForm] = useState(false)
    const navigate = useNavigate()
    const [tutors, setTutors] = useState([])

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

    const handleRemoveTutor = async(uid) => {
        try {
            const token = localStorage.getItem("token")
            const response = await fetch('http://127.0.0.1:5000/remove-tutor', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({uid: uid})
            })
            
            if (response.ok) {
                const result = await response.json()
                setSuccess(result.message)
                setTutors((prevTutors) => prevTutors.filter(tutor => tutor.id !== uid))
            } else {
                const result = await response.json();
                setError(result.error || "Error removing tutor");
                console.error(result.error);
            }
        } catch(error) {
            console.log(error.message)
            setError(error.message)
        }
    }

    useEffect(() => {
        const fetchTutors = async () => {
            const token = localStorage.getItem("token")
            try {
                const response = await fetch('http://127.0.0.1:5000/admin-dash', {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
    
                if (response.ok) {
                    const result = await response.json()
                    setTutors(result.tutors)
                    console.log(result.tutors)
                } else {
                    const result = await response.json()
                    setError(result.message || "Error fetching tutors")
                }
            } catch (error) {
                console.log(error.message)
                setError(error.message)
            }
        };
    
        fetchTutors()
    }, [])

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
                <NewTutorForm handleAddTutorClick={handleAddTutorClick} setError={setError} setSuccess={setSuccess} setTutors={setTutors}/>
            )}
            <AdminTutorInfo tutors={tutors} handleRemoveTutor={handleRemoveTutor}/>
        </div>
    )
}

export default withAuth(AdminDash, 'admin')