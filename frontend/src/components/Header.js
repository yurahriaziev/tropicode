import React from "react";
import '../css/Header.css'
import { useLocation, useNavigate } from "react-router-dom";

export default function Header({ setCurrentTab }) {
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        navigate('/')
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('token_expiry')
        localStorage.removeItem('userId')
    }

    const handleTabSwitch = (tab) => {
        if (location.pathname.includes('/student-dash')) {
            setCurrentTab(tab)
        } else {
            const id = localStorage.getItem('userId')
            console.log(id)
            navigate(`/student-dash/${id}`)
        }
    }

    return (
        <header class="header">
            <div class="container">
                <nav class="nav">
                    <div class="nav-left">
                        <a class="brand">
                            <div class="mascot-container">
                                <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/purple-mascot-zBlxf4xblDX3NHt8mWIWtX8Yzwb5PO.png" alt="Purple Chameleon Mascot" class="mascot-image"/>
                            </div>
                            TropiCode
                        </a>
                        <a onClick={() => handleTabSwitch('home')} class="nav-button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                            <span>Home</span>
                        </a>
                        <a onClick={() => handleTabSwitch('classes')} class="nav-button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                            </svg>
                            <span>Classes</span>
                        </a>
                        <a onClick={() => handleTabSwitch('homework')} class="nav-button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                            </svg>
                            <span>Homework</span>
                        </a>
                    </div>
                    <div class="nav-right">
                        <button onClick={handleLogout} class="icon-button logout">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" x2="9" y1="12" y2="12"/>
                            </svg>
                        </button>
                        <button class="icon-button mobile-menu">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="4" x2="20" y1="12" y2="12"/>
                                <line x1="4" x2="20" y1="6" y2="6"/>
                                <line x1="4" x2="20" y1="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    )
}