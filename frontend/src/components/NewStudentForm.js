import React, { useState } from "react";
import {API_BASE_URL} from "../config";

export default function NewStudentForm({ handleAddStudentClick, setError, setSuccess, setStudents, tutorId }) {
    const [first, setFirst] = useState('')
    const [last, setLast] = useState('')
    const [age, setAge] = useState('')

    const handleSubmit = async(e) => {
        e.preventDefault()
        console.log(first)
        console.log(last)
        console.log(age)
        const toSend = {
            tutor: tutorId,
            first: first,
            last: last,
            age: age,
        }
        try {
            const token = localStorage.getItem("token")
            console.log("Authorization Token:", token);
            const response = await fetch(`${API_BASE_URL}/create-student`, 
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(toSend)
                }
            )

            const result = await response.json();

            if (response.ok) {
                console.log("Student added successfully:", result)
                setError('')
                setSuccess('Student added successfully!')
                setStudents(result.students)
                handleAddStudentClick(false)
            } else {
                setError(result.error || 'SERVER - Error while adding new student, try again')
            }
        } catch (error) {
            setError('CLIENT - Error while adding new student, try again')
            console.log(error)
        }
    }

    return (
        <div className="tutor-form-cont">
            <button onClick={() => handleAddStudentClick(false)}>Close</button>
            <div className="tutor-form-title">
                Add new student.
            </div>
            <div className="tutor-form">
                <form onSubmit={handleSubmit}>
                    <input
                        type="text" 
                        placeholder="First Name" 
                        value={first}
                        required={true}
                        onChange={(e) => setFirst(e.target.value)}
                    />
                    <input
                        type="text" 
                        placeholder="Last Name" 
                        value={last}
                        required={true}
                        onChange={(e) => setLast(e.target.value)}
                    />
                    <input
                        type="number" 
                        placeholder="Age" 
                        value={age}
                        required={true}
                        onChange={(e) => setAge(e.target.value)}
                        min={0}
                    />
                    <button type="submit">Add Student</button>
                </form>
            </div>
        </div>
    )
}