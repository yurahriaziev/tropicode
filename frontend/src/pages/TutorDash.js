import React, { useState, useEffect } from "react";
import withAuth from "../withAuth";
import NewStudentForm from "../components/NewStudentForm";
import { useNavigate, useParams } from "react-router-dom";
import TutorStudentsList from "../components/TutorStudentsList";

function TutorDash() {
    const { tutorId } = useParams()
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [addStudentForm, setAddStudentForm] = useState(false)
    const navigate = useNavigate()
    const [students, setStudents] = useState([])
    const [tutorData, setTutorData] = useState({})
    const { googleConn } = useParams()
    const isGoogleConnected = googleConn === "true"
    const [meetLink, setMeetLink] = useState('')

    const handleAddStudentClick = (open) => {
        setAddStudentForm(open)
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

    useEffect(() => {
        const fetchStudents = async () => {
            if (!tutorId) {
                setError('Tutor ID is missing')
                
            }

            const token = localStorage.getItem("token")
            console.log(tutorId)
            console.log(googleConn)
            try {
                const response = await fetch('http://127.0.0.1:5000/tutor-dash', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ tutorId })
                });
    
                if (response.ok) {
                    const result = await response.json()
                    console.log('Full result\n', result)    // LOG
                    setTutorData(result.tutorData)
                    setStudents(result.students)
                } else {
                    const result = await response.json()
                    setError(result.message || "Error fetching students")
                }
            } catch (error) {
                console.log(error.message)  // LOG
                setError(error.message)
            }
        };
    
        fetchStudents()
    }, [tutorId, googleConn])

    const handleRemoveStudent = async(uid) => {
        try {
            const token = localStorage.getItem("token")
            const response = await fetch('http://127.0.0.1:5000/remove-student', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({collection: 'students', uid: uid, tutorId: tutorId})
            })
            
            if (response.ok) {
                const result = await response.json()
                setSuccess(result.message)
                setStudents((prevStudents) => prevStudents.filter(student => student.id !== uid))
            } else {
                const result = await response.json();
                setError(result.error || "Error removing student")
                console.error(result.error)    // LOG
            }
        } catch(error) {
            console.log(error.message)  // LOG
            setError(error.message)
        }
    }

    const connectGoogleAccount = async(tutorId) => {
        try {
            window.location.href = `http://127.0.0.1:5000/google/login?tutorId=${tutorId}`
        } catch (error) {
            console.error('Error occurred:', error)  // LOG
            setError('An unexpected error occurred. Please try again.')
        }
    }

    const createNewMeeting = async() => {
        try {
            const response = await fetch('http://127.0.0.1:5000/create-meeting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ tutorId })
            })

            if (response.ok) {
                const result = await response.json()
                setMeetLink(result.meetLink)
                setSuccess('Class created successfully!')
            } else {
                const error = await response.json()
                console.log(error)  // LOG
                setError(error.error)
            }
        } catch (error) {
            console.error('Error:', error)  // LOG
            setError('An error occurred while creating the Google Meet link.')
        }
    }

    return (
        <div className="tutor-cont">
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
            <div className="header-cont">
                <h1>Welcome Tutor</h1>
                <h2>{tutorData.email} | {tutorId} | {isGoogleConnected ? 'Google Account Connected' : 'Connect Google Account'}</h2>
            </div>
            <div className="actions-cont">
                <button onClick={() => handleAddStudentClick(true)}>Add student</button>
                <button onClick={createNewMeeting}>Create a class</button>
                {!isGoogleConnected && (<button onClick={() => connectGoogleAccount(tutorId)}>Connect Google Account</button>)}
            </div>
            {addStudentForm && (
                <NewStudentForm handleAddStudentClick={handleAddStudentClick} setError={setError} setSuccess={setSuccess} setStudents={setStudents} tutorId={tutorId} />
            )}
            <div className="tutor-data-cont">
                {tutorData && (
                    <h3>{tutorData.email}</h3>
                )}
            </div>
            <div className="students-cont">
                <h2>Your students</h2>
                <TutorStudentsList students={students} handleRemoveStudent={handleRemoveStudent}/>
            </div>
            <div className="classes-cont">
                <h2>Upcoming classes</h2>
                {meetLink && (
                    <a href={meetLink} target="_blank" rel="noopener noreferrer">{meetLink}</a>
                )}
            </div>
        </div>
    )
}

export default withAuth(TutorDash, 'tutor')