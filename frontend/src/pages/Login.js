import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login({ role }) {
    const [userCode, setUserCode] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (location.state && location.state.error) {
            setError(location.state.error)
        }
    }, [location.state])

    const handleInput = (e) => {
        const input = e.target.value.toUpperCase()
        setUserCode(input)
    }

    useEffect(() => {
        if (error) {
            console.log(error)
        }
    }, [error])

    const handleLogin = async(e) => {
        setError('')
        e.preventDefault()
        console.log('login btn clicked', userCode)

        try {
            const response = await fetch("http://127.0.0.1:5000/process-login", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({data: userCode.toUpperCase()})
            })

            if (response.ok) {
                const result = await response.json();
                console.log(result.message);
                console.log(result.role);
                console.log(result.token);
                setError('')

                localStorage.setItem("role", result.role)
                localStorage.setItem("token", result.token)
                const tokenExp = Date.now() + 60 * 60 * 1000
                localStorage.setItem("token_expiry", tokenExp)

                if (result.role === 'admin') {
                    navigate('/admin-dash')
                } else if (result.role === 'tutor') {
                    navigate('/tutor-dash')
                } else if (result.role === 'student') {
                    navigate('/student-dash')
                }
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
            {error && (
                <div style={{ fontWeight: 'bold', backgroundColor: 'red', color: 'white', padding: '10px', marginBottom: '10px' }}>
                    {error}
                </div>
            )}
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
        </div>
    )
}