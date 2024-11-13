import React, { useState } from "react";

export default function NewTutorForm({ handleAddTutorClick, setError }) {
    const [first, setFirst] = useState('test')
    const [last, setLast] = useState('test')
    const [email, setEmail] = useState('test')
    const [age, setAge] = useState('18')
    const [teaches, setTeaches] = useState('test')

    const handleSubmit = async(e) => {
        e.preventDefault()
        console.log(first)
        console.log(last)
        console.log(email)
        console.log(age)
        console.log(teaches)
        const toSend = {
            first: first,
            last: last,
            email: email,
            age: age,
            teaches: teaches
        }
        try {
            const token = localStorage.getItem("token")
            console.log("Authorization Token:", token);
            const response = await fetch('http://127.0.0.1:5000/create-tutor', 
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
                console.log("Tutor added successfully:", result);
                setError(''); // Clear any previous error messages
                handleAddTutorClick(false); // Close the form on success
            } else {
                setError(result.error || 'SERVER - Error while adding new tutor, try again');
            }
        } catch (error) {
            setError('CLIENT - Error while adding new tutor, try again')
            console.log(error)
        }
    }

    return (
        <div className="tutor-form-cont">
            <button onClick={() => handleAddTutorClick(false)}>Close</button>
            <div className="tutor-form-title">
                Add new tutor.
            </div>
            <div className="tutor-form">
                <form onSubmit={handleSubmit}>
                    <input
                        type="text" 
                        placeholder="First Name" 
                        value={first}
                        onChange={(e) => setFirst(e.target.value)}
                    />
                    <input
                        type="text" 
                        placeholder="Last Name" 
                        value={last}
                        onChange={(e) => setLast(e.target.value)}
                    />
                    <input
                        type="number" 
                        placeholder="Age" 
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        min={0}
                    />
                    <input
                        type="text" 
                        placeholder="Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="text" 
                        placeholder="Subject taught" 
                        value={teaches}
                        onChange={(e) => setTeaches(e.target.value)}
                    />
                    <button type="submit">Add Tutor</button>
                </form>
            </div>
        </div>
    )
}