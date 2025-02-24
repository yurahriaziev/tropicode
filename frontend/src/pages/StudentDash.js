import React, { useEffect, useState } from "react";
import withAuth from "../withAuth";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config";
import StudentClassList from "../components/StudentClassList";
import StudentHomeworkList from "../components/StudentHomeworkList";
import Header from "../components/Header";
import Card from "../components/Card";

function StudentDash() {
    const navigate = useNavigate()
    const [studentData, setStudentData] = useState({})
    const { studentId } = useParams()
    const [error, setError] = useState('')
    const [upcomingClasses, setUpcomingClasses] = useState([])
    const [currentTab, setCurrentTab] = useState('home')
    const [assignedHomework, setAssignedHomework] = useState([])
    const [success, setSuccess] = useState('')
    const [upcomingClass, setUpcomingClass] = useState({})
    const [upcomingHomework, setUpcomingHomework] = useState([])

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
                    setUpcomingHomework(result.upcomingHomework)
                    setUpcomingClass(result.upcomingClass)
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
        navigate('/game')
    }

    return (
        <div className="student-cont">
            <Header setCurrentTab={setCurrentTab}/>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="student-header">
                <h1 className="student-title">Welcome {studentData.first}!</h1>
            </div>

            <div className="student-content">
                {currentTab === 'classes' && (
                    <>
                        <h2 className="section-title">Your Classes</h2>
                        <div className="student-class-list">
                            <StudentClassList upcomingClasses={upcomingClasses} />
                        </div>
                    </>
                )}

                {currentTab === 'homework' && (
                    <>
                        <h2 className="section-title">Your Homework</h2>
                        <div className="student-homework-list">
                            <StudentHomeworkList homeworks={assignedHomework} setError={setError} setSuccess={setSuccess} />
                        </div>
                    </>
                )}

                {currentTab === 'home' && (
                    <>
                        <Card card='upcoming-classes' upcomingClass={upcomingClass} />
                        <Card card='homework' upcomingHomework={upcomingHomework}/>
                    </>
                )}
            </div>
        </div>
    )
}

export default withAuth(StudentDash, 'student')