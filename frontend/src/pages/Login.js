import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../config";
import '../css/Login.css';

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

        try {
            const response = await fetch(`${API_BASE_URL}/process-login`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({data: userCode.toUpperCase()})
            })

            if (response.ok) {
                const result = await response.json();
                setError('')

                localStorage.setItem("role", result.role)
                localStorage.setItem("token", result.token)
                const tokenExp = Date.now() + 60 * 60 * 1000
                localStorage.setItem("token_expiry", tokenExp)

                if (result.role === 'admin') {
                    navigate('/admin-dash')
                } else if (result.role === 'tutor') {
                    navigate(`/tutor-dash/${result.userId}/${result.googleConnected}`)
                } else if (result.role === 'student') {
                    navigate(`/student-dash/${result.userId}`)
                }
            } else {
                const result = await response.json();
                setError(result.message)
            }
        } catch (error) {
            console.log(error.message)  // LOG
            setError('Login failed')
        }
    }

    return (
        <div className="login-page">
            <div className="login-box">
                {error && <div className="error-message">{error}</div>}
                <h2 className="login-title">Login with Your Code</h2>
                <input 
                    type="text" 
                    placeholder="Enter Code" 
                    maxLength={4} 
                    className="input-field" 
                    value={userCode} 
                    onChange={handleInput}
                />
                <button className="login-button" onClick={handleLogin}>
                    Login
                </button>
            </div>
        </div>
    )
}