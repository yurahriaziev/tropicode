import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { useParams } from "react-router-dom";
import IDE from "../components/IDE";
import '../css/HomeworkPage.css'
import Header from "../components/Header";

export default function HomeworkPage() {
    const [hw, setHw] = useState({})
    const [testCases, setTestCases] = useState([])
    const { id } = useParams()
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        const fetchHomeworkData = async() => {
            const token = localStorage.getItem('token')

            try {
                const response = await fetch(`${API_BASE_URL}/fetch-homework`, {
                    method:'POST',
                    headers: {
                        'Content-Type':'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ id })
                })

                if (response.ok) {
                    const result = await response.json()
                    console.log(result)
                    setHw(result.homework)
                    setTestCases(result.homework.testCases)
                } else {
                    const result = await response.json()
                    setError('Failed to fetch homework')
                    console.log(result.error)
                }
            } catch (error) {
                console.error("Fetch failed:", error);
                setError("Fetch failed. Try again!");
            }
        }

        fetchHomeworkData()
    }, [id])

    return (
        <div>
            <Header />
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <main className="homework-container">
                <div className="homework-grid">
                <div className="card description-section">
                    <div className="mascot-helper">
                        <div>
                            <h1 className="title">
                            <i className="material-icons">code</i>
                            {hw.title}
                            </h1>
                        </div>
                    </div>

                    <div className="description">
                        <p>{hw.desc}</p>
                    </div>

                    <div className="test-cases">
                    <h3>Test Your Code:</h3>
                    {testCases && (
                        <div className="testCases-cont">
                            {testCases.map((testCase, index) => (
                                <div key={index} className="test-case">
                                    <p>Input: {testCase.input}</p>
                                    <p>Expected Output: {testCase.expectedOutput}</p>
                                </div>
                            ))}
                        </div>
                    )}        
                    </div>
                </div>

                <div className="card ide-section">
                    <IDE homeworkId={hw.id} setError={setError} setSuccess={setSuccess} />
                </div>
                </div>
            </main>
        </div>
    )
}