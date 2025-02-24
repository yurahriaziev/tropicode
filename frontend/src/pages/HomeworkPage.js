import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { useParams } from "react-router-dom";
import IDE from "../components/IDE";
import '../css/HomeworkPage.css'
import Header from "../components/Header";

export default function HomeworkPage() {
    const [hw, setHw] = useState({})
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
        // <div>
        //     {error && (
        //         <div style={{ fontWeight: 'bold', backgroundColor: 'red', color: 'white', padding: '10px', marginBottom: '10px' }}>
        //             {error}
        //         </div>
        //     )}
        //     {success && (
        //         <div style={{ fontWeight: 'bold', backgroundColor: 'green', color: 'white', padding: '10px', marginBottom: '10px' }}>
        //             {success}
        //         </div>
        //     )}
        //     <main className="homework-container">
        //         <div className="card">
        //             <div className="mascot-helper">
        //                 <div>
        //                     <h1 className="title">
        //                         <i className="material-icons">code</i>
        //                         {/* title of homework */}
        //                         {hw.title}
        //                     </h1>
        //                 </div>
        //             </div>

        //             <div className="description">
        //                 <p>{hw.desc}</p>
        //                 {/* <p>For example, if you have the word "hello", you'll swap the 'e' and 'o' to get "holle".</p> */}
        //             </div>

        //             {/* <div class="hint-card">
        //                 <strong>💡 Helpful Hint:</strong>
        //                 <p>Remember, the vowels are 'a', 'e', 'i', 'o', and 'u'. They can be uppercase or lowercase!</p>
        //             </div> */}

        //             {/* <div class="code-editor">
        //                 <textarea class="code-area" placeholder="Write your code here...">def reverseVowels(word):
        //     # Your code goes here
        //     return word</textarea>
        //             </div> */}

        //             <IDE homeworkId={hw.id} setError={setError} setSuccess={setSuccess} />

        //             <div className="test-cases">
        //                 <h3>Test Your Code:</h3>
        //                 <div className="test-case">
        //                     <p>Input: "hello"</p>
        //                     <p>Expected Output: "holle"</p>
        //                 </div>
        //                 <div className="test-case">
        //                     <p>Input: "CODING"</p>
        //                     <p>Expected Output: "CODENG"</p>
        //                 </div>
        //             </div>

        //             <div className="button-group">
        //                 <button className="button button-primary">
        //                     <i className="material-icons">play_arrow</i>
        //                     Run Code
        //                 </button>
        //                 <button className="button button-secondary">
        //                     <i className="material-icons">check_circle</i>
        //                     Submit Solution
        //                 </button>
        //             </div>
        //         </div>
        //         {/* <Homework />     */}
        //     </main>
        // </div>
        <div>
            <Header />
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <main className="homework-container">
                <div className="homework-grid">
                {/* Left Column - Description */}
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
                    <div className="test-case">
                        <p>Input: "hello"</p>
                        <p>Expected Output: "holle"</p>
                    </div>
                    <div className="test-case">
                        <p>Input: "CODING"</p>
                        <p>Expected Output: "CODENG"</p>
                    </div>
                    </div>
                </div>

                {/* Right Column - IDE */}
                <div className="card ide-section">
                    <IDE homeworkId={hw.id} setError={setError} setSuccess={setSuccess} />
                </div>
                </div>
            </main>
        </div>
    )
}