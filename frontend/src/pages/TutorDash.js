import React, { useState, useEffect } from "react";
import withAuth from "../withAuth";
import NewStudentForm from "../components/NewStudentForm";
import { useLocation, useNavigate } from "react-router-dom";
import TutorStudentsList from "../components/TutorStudentsList";

function TutorDash() {
    const location = useLocation()
    const { tutorId } = location.state || {}
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [addStudentForm, setAddStudentForm] = useState(false)
    const navigate = useNavigate()
    const [students, setStudents] = useState([])
    const [meetingLink, setMeetingLink] = useState('')
    const [tutorData, setTutorData] = useState({})

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
            const token = localStorage.getItem("token")
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
                    setTutorData(result.tutorData)
                    console.log(result.tutorData)
                    setStudents(result.students)
                    console.log(result.students)
                } else {
                    const result = await response.json()
                    setError(result.message || "Error fetching students")
                }
            } catch (error) {
                console.log(error.message)
                setError(error.message)
            }
        };
    
        fetchStudents()
    }, [tutorId])

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
                setError(result.error || "Error removing student");
                console.error(result.error);
            }
        } catch(error) {
            console.log(error.message)
            setError(error.message)
        }
    }

    const handleCreateNewMeeting = async() => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://127.0.0.1:5000/create-meeting', {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json',
                    'Accept':'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_email: tutorData.email,
                    title: "Class with Students",
                    description: "This is a test meeting for the class.",
                    start_time: "2024-12-05T15:00:00-05:00",
                    end_time: "2024-12-05T16:00:00-05:00",
                    time_zone: "America/New_York",
                })
            })

            if (response.ok) {
                const result = await response.json()
                setMeetingLink(result.meeting_link)
                setSuccess('Meeting successfully created')
            } else {
                const result = await response.json()
                setError(result.error)
            }
        } catch (error){
            console.log(error.message);
            setError(error.message);
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
            </div>
            <div className="actions-cont">
                <button onClick={() => handleAddStudentClick(true)}>Add student</button>
                <button onClick={handleCreateNewMeeting}>Create a class</button>
            </div>
            {addStudentForm && (
                <NewStudentForm handleAddStudentClick={handleAddStudentClick} setError={setError} setSuccess={setSuccess} setStudents={setStudents} tutorId={tutorId} />
            )}
            {meetingLink && (
                <div className="meeting-link">
                    <h3>Your Meeting Link:</h3>
                    <a href={meetingLink} target="_blank" rel="noopener noreferrer">{meetingLink}</a>
                </div>
            )}
            <div className="students-cont">
                <h2>Your students</h2>
                {/* Here will be a table with students: Name | Action */}
                <TutorStudentsList students={students} handleRemoveStudent={handleRemoveStudent}/>
            </div>
        </div>
    )
}

export default withAuth(TutorDash, 'tutor')