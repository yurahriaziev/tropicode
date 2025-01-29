import React, { useState, useEffect } from "react";
import withAuth from "../withAuth";
import NewStudentForm from "../components/NewStudentForm";
import { useNavigate, useParams } from "react-router-dom";
import TutorStudentsList from "../components/TutorStudentsList";
import NewClassForm from "../components/NewClassForm";
import API_BASE_URL from "../config";
import TutorClassList from "../components/TutorClassList";
import TutorHomeworkList from "../components/TutorHomeworkList";

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
    const [newClassForm, setNewClassForm] = useState(false)
    const [upcomingClasses, setUpcomingClasses] = useState([])
    const [assignedHomework, setAssignedHomework] = useState([])
    const [currentTab, setCurrentTab] = useState('classes')

    const handleAddStudentClick = (open) => {
        setAddStudentForm(open)
        if (open) setSuccess('')
    }

    const handleTabSwitch = (tab) => {
        setCurrentTab(tab)
    }

    const handleNewClassClick = async(open) => {
        try {
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
        if (error) {
            const timer = setTimeout(() => {
                setError('')
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [success, error])

    useEffect(() => {
        const fetchStudents = async () => {
            if (!tutorId) {
                setError('Tutor ID is missing!')
            }

            const token = localStorage.getItem("token")
            try {
                const response = await fetch(`${API_BASE_URL}/tutor-dash`, {
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
                    setTutorData(result.tutorData)
                    setStudents(result.students)
                    setUpcomingClasses(result.upcomingClasses)
                    // fetch assigned homework here
                    console.log(result.upcomingClasses)
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
            const response = await fetch(`${API_BASE_URL}/remove-student`, {
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

    const handleRemoveClass = async(classId, studentId) => {
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_BASE_URL}/remove-class`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({tutorId, studentId, classId})
            })

            if (response.ok) {
                const result = await response.json()
                setSuccess(result.message)
                setUpcomingClasses((prevClasses) => prevClasses.filter(_class => _class.class_id !== classId))
            } else {
                const result = await response.json();
                setError(result.error || "Error removing class")
                console.error(result.error)    // LOG
            }
        } catch(error) {
            console.log(error.message)  // LOG
            setError(error.message)
        }
    }

    const connectGoogleAccount = async(tutorId) => {
        try {
            window.location.href = `${API_BASE_URL}/google/login?tutorId=${tutorId}`
        } catch (error) {
            console.error('Error occurred:', error)  // LOG
            setError('An unexpected error occurred. Please try again.')
        }
    }

    const displayStandardTime = (iso) => {
        const date = new Date(iso)
        let hours = date.getUTCHours()
        const minutes = date.getUTCMinutes().toString().padStart(2, "0")
        const suffix = hours >= 12 ? "PM" : "AM"
        hours = hours % 12 || 12
        return `${hours}:${minutes} ${suffix}`
    }

    const createNewMeeting = async( summary, startTime, endTime, assignedStudentId ) => {
        try {
            const response = await fetch(`${API_BASE_URL}/create-meeting`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ tutorId, summary, startTime, endTime, assignedStudentId })
            })

            if (response.ok) {
                const result = await response.json()

                result.class.startDate = result.class.start.split('T')[0]
                result.class.endDate = result.class.end.split('T')[0]

                result.class.startTime = displayStandardTime(result.class.start)
                result.class.endTime = displayStandardTime(result.class.end)
                console.log(result)
                setUpcomingClasses((prevClasses => [...prevClasses, result.class]))
                handleNewClassClick(false)
                setSuccess('Class created successfully!')
            } else {
                const error = await response.json()
                console.log(error)  // LOG
                setError(error.error)
                window.location.href = `${API_BASE_URL}/#/tutor-dash/${tutorId}/${isGoogleConnected}`
            }
        } catch (error) {
            console.error('Error:', error)  // LOG
            setError('An error occurred while creating the Google Meet link.')
        }
    }

    const handleAddHomework = async(studId, homework) => {
        try {
            const response = await fetch(`${API_BASE_URL}/add-homework`, {
                method:'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ studId, homework:homework })
            })

            if (response.ok) {
                const result = await response.json()

                setAssignedHomework((prevHomework => [...prevHomework, result]))
                setSuccess('Homework assigned successfully!')
            } else {
                const error = await response.json()
                console.log(error) // LOG
                setError(error.error)
            }

            // console.log(studId)
            // console.log(tutorId)
            // console.log(homework)
        } catch (error) {
            console.error('Error:', error)  // LOG
            setError(`An error occurred while adding new homework to ${studId}`)
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
                <h2>{tutorData.email} | {isGoogleConnected ? 'Google Account Connected' : 'Connect Google Account'}</h2>
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
            <div className="students-cont">
                <h2>Your students</h2>
                <TutorStudentsList students={students}
                                    handleRemoveStudent={handleRemoveStudent}
                                    handleAddHomework={handleAddHomework}
                                    setError={setError}
                                    setSuccess={setSuccess}
                />
            </div>
            <div className="classes-homework-cont">
                {currentTab === 'classes' ? (
                    <div className="classes-cont">
                        <button onClick={() => handleTabSwitch('homework')}>Homework</button>
                        <h2>Your classes</h2>
                        <TutorClassList upcomingClasses={upcomingClasses} handleRemoveClass={handleRemoveClass} />
                    </div>
                ) : (
                    <div className="homework-cont">
                        <button onClick={() => handleTabSwitch('classes')}>Classes</button>
                        <h2>Assigned Homework</h2>
                        <TutorHomeworkList assignedHomework={assignedHomework} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default withAuth(TutorDash, 'tutor')