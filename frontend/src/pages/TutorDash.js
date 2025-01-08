import React, { useState, useEffect } from "react";
import withAuth from "../withAuth";
import NewStudentForm from "../components/NewStudentForm";
import { useNavigate, useParams } from "react-router-dom";
import TutorStudentsList from "../components/TutorStudentsList";
import NewClassForm from "../components/NewClassForm";
import API_BASE_URL from "../config";

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
    // const [meetLink, setMeetLink] = useState('')
    const [newClassForm, setNewClassForm] = useState(false)
    const [upcomingClasses, setUpcomingClasses] = useState([])

    const handleAddStudentClick = (open) => {
        setAddStudentForm(open)
        if (open) setSuccess('')
    }
    const handleNewClassClick = async(open) => {
        try {
            console.log('got here') // LOG
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_BASE_URL}/check-token`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tutorId })
            })

            const result = await response.json();
            if (response.ok) {
                console.log('Token is valid or refreshed successfully.')
                setNewClassForm(open)
                if (open) setSuccess('')
            } else {
                window.location.href = `${API_BASE_URL}/google/login?tutorId=${tutorId}`
                console.error(result.error)
                setError(result.error)
            }

        } catch (error) {
            console.log(error.message)  // LOG
            setError(error.message)
        }
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
                setError('Tutor ID is missing!')
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
                })
    
                if (response.ok) {
                    const result = await response.json()
                    console.log('Full result\n', result)    // LOG
                    setTutorData(result.tutorData)
                    setStudents(result.students)
                    setUpcomingClasses(result.upcomingClasses)
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

    const createNewMeeting = async( summary, startTime, endTime, assignedStudentId ) => {
        try {
            const response = await fetch('http://127.0.0.1:5000/create-meeting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ tutorId, summary, startTime, endTime, assignedStudentId })
            })

            if (response.ok) {
                const result = await response.json()
                const newClass = {
                    link: result.meetLink,
                    studentName: result.studentName
                }
                setUpcomingClasses((prevClasses => [...prevClasses, newClass]))
                // setMeetLink(result.meetLink)
                handleNewClassClick(false)
                setSuccess('Class created successfully!')
            } else {
                const error = await response.json()
                console.log(error)  // LOG
                setError(error.error)
                window.location.href = `http://127.0.0.1:5000/google/login?tutorId=${tutorId}`
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
                <button 
                    onClick={() => handleNewClassClick(true)}
                    disabled={!isGoogleConnected}
                    title={!isGoogleConnected ? 'Google Account Required' : ''}
                    style={{
                        backgroundColor: !isGoogleConnected && '#CCCCCC',
                        cursor: isGoogleConnected ? 'pointer' : 'not-allowed',
                    }}
                >Create a class
                </button>
                {!isGoogleConnected && (<button onClick={() => connectGoogleAccount(tutorId)}>Connect Google Account</button>)}
            </div>
            {addStudentForm && (
                <NewStudentForm handleAddStudentClick={handleAddStudentClick} setError={setError}
                setSuccess={setSuccess} setStudents={setStudents} tutorId={tutorId} />
            )}
            {newClassForm && (
                <NewClassForm handleNewClassClick={handleNewClassClick} setError={setError}
                createNewMeeting={createNewMeeting} students={students} />
            )}
            <div className="tutor-data-cont">
                {tutorData && (
                    <h3>{tutorData.email}</h3>
                )}
            </div>
            <div className="students-cont">
                <h2>Your students</h2>
                <TutorStudentsList students={students} handleRemoveStudent={handleRemoveStudent} />
            </div>
            <div className="classes-cont">
                <h2>Upcoming classes</h2>
                {upcomingClasses.length > 0 ? (
                    <ul>
                        {upcomingClasses.map((classData, index) => (
                            <li key={index}>
                                <a href={classData.link} target="_blank" rel="noopener noreferrer">
                                    {classData.link}
                                </a>
                                <p>{classData.studentName}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No upcoming classes yet.</p>
                )}
            </div>
        </div>
    )
}

export default withAuth(TutorDash, 'tutor')