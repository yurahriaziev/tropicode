import React, { useState } from "react";

export default function Login({ role }) {
    const [userCode, setUserCode] = useState('')
    const handleInput = (e) => {
        const input = e.target.value
        setUserCode(input)
    }
    const handleLogin = (e) => {
        e.preventDefault()
        console.log('login btn clicked', userCode)
    }

    return (
        <div className="login-cont">
            <h2>{role === 'student' ? 'Student Login' : 'Tutor Login'}</h2>
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="Enter Code" maxLength={4} className="code-input" value={userCode} onChange={handleInput}/>
                <button>Login</button>
            </form>
        </div>
    )
}