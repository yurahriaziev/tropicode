import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ role }) {
    const [userCode, setUserCode] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleInput = (e) => {
        const input = e.target.value
        setUserCode(input)
    }

    useEffect(() => {
        if (error) {
            console.log(error)
        }
    }, [error])

    const handleLogin = async(e) => {
        e.preventDefault()
        console.log('login btn clicked', userCode)
        // TODO: access '/api/process-login' route and send userCode to backend
        try {
            const response = await fetch("http://127.0.0.1:5000/process-login", {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({data: userCode})
            })

            if (response.ok) {
                const result = await response.json();
                console.log(result.message);
                console.log(result.userCode);
                setError('')
            } else {
                const result = await response.json();
                setError(result.message)
                console.error(result.message);
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    const changeLogin = (role) => {
        navigate(`/login-${role}`)
    }

    return (
        <div className="login-cont">
            <h2>{role === 'student' ? 'Student Login' : 'Tutor Login'}</h2>
            <form onSubmit={handleLogin}>
                <input 
                    type="text" 
                    placeholder="Enter Code" 
                    maxLength={4} 
                    className="code-input" 
                    value={userCode} 
                    onChange={handleInput}
                />
                <button>Login</button>
            </form>
            {role === 'student' ? (
                <button onClick={() => changeLogin('tutor')}>Tutor? Login here</button>
            ) : (
                <button onClick={() => changeLogin('student')}>Student? Login here</button>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    )
}