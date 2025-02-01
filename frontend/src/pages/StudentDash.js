import React, { useEffect, useState } from "react";
import withAuth from "../withAuth";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../config";
import StudentClassList from "../components/StudentClassList";
import StudentHomeworkList from "../components/StudentHomeworkList";

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

    return (
        <div className="student-cont">
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
            <h1>Welcome {studentData.first}!</h1>
            {currentTab === 'classes' ? (
                <>
                    <h2>Your classes<button onClick={() => handleTabSwitch('homework')}>Homework</button></h2>
                    <StudentClassList upcomingClasses={upcomingClasses} />
                </>
            ) : (
                <>
                    <h2>Your homework<button onClick={() => handleTabSwitch('classes')}>Classes</button></h2>
                    <StudentHomeworkList homeworks={assignedHomework} setError={setError} setSuccess={setSuccess}/>
                </>
            )}
        </div>
    )
}

export default withAuth(StudentDash, 'student')