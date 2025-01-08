import React, { useEffect, useState } from "react";
import withAuth from "../withAuth";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../config";

function StudentDash() {
    const navigate = useNavigate()
    const [studentData, setStudentData] = useState({})
    const { studentId } = useParams()
    const [error, setError] = useState('')
    const [upcomingClasses, setUpcomingClasses] = useState([])

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
                    setUpcomingClasses(result.studentData.upcoming_classes)
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
            <button onClick={handleLogout}>Logout</button>
            <h1>Welcome {studentData.first}!</h1>
            <div className="classes-cont">
                <h2>Upcoming classes</h2>
                {upcomingClasses.length > 0 ? (
                    <ul>
                        {upcomingClasses.map((classData, index) => (
                            <li key={index}>
                                <a href={classData.link} target="_blank" rel="noopener noreferrer">
                                    {classData.link}
                                </a>
                                <p>{classData.tutor_id}</p>
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

export default withAuth(StudentDash, 'student')