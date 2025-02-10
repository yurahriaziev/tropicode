import React, { useEffect, useState } from "react";
import withAuth from "../withAuth";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../config";
import StudentClassList from "../components/StudentClassList";
import StudentHomeworkList from "../components/StudentHomeworkList";
// import "../css/StudentDash.css"

function StudentDash() {
    const navigate = useNavigate()
    const [studentData, setStudentData] = useState({})
    const { studentId } = useParams()
    const [error, setError] = useState('')
    const [upcomingClasses, setUpcomingClasses] = useState([])
    const [currentTab, setCurrentTab] = useState('classes')
    const [assignedHomework, setAssignedHomework] = useState([])
    const [success, setSuccess] = useState('')

    const handleTabSwitch = (tab) => {
        setCurrentTab(tab)
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

    const handleLogout = () => {
        navigate('/')
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('token_expiry')
    }

    useEffect(() => {
        const fetchStudentDash = async() => {
            if (!studentId) {
                setError('Student ID missing!')
            }

            const token = localStorage.getItem('token')
            try {
                const response = await fetch(`${API_BASE_URL}/student-dash`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }, 
                    body: JSON.stringify({ studentId })
                })

                if (response.ok) {
                    const result = await response.json()
                    console.log('Full result\n', result)    // LOG
                    setStudentData(result.studentData)
                    setUpcomingClasses(result.classes)
                    setAssignedHomework(result.homeworks)
                } else {
                    const result = await response.json()
                    setError(result.error || "Error fetching student dash")
                }
            } catch (error) {
                console.log(error.message)  // LOG
                setError(error.message)
            }
        }

        fetchStudentDash()
    }, [studentId])

    const handleGameClick = () => {
        // 1. send to another route http://localhost:3000/#/game
        // 2. stream pygame on that route
    }

    return (
        <div className="student-cont">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="student-header">
                <h1 className="student-title">Welcome {studentData.first}!</h1>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>

            <div className="student-tabs">
                <button 
                    className={`tab-button ${currentTab === 'homework' ? 'active' : ''}`} 
                    onClick={() => handleTabSwitch('classes')}
                >
                    Classes
                </button>
                <button 
                    className={`tab-button ${currentTab === 'classes' ? 'active' : ''}`} 
                    onClick={() => handleTabSwitch('homework')}
                >
                    Homework
                </button>
                <button 
                    onClick={handleGameClick}
                >
                    Start Game
                </button>
            </div>

            <div className="student-content">
                {currentTab === 'classes' ? (
                    <>
                        <h2 className="section-title">Your Classes</h2>
                        <div className="student-class-list">
                            <StudentClassList upcomingClasses={upcomingClasses} />
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="section-title">Your Homework</h2>
                        <div className="student-homework-list">
                            <StudentHomeworkList homeworks={assignedHomework} setError={setError} setSuccess={setSuccess} />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default withAuth(StudentDash, 'student')