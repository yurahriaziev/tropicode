import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { API_BASE_URL, PYTHON_RUN_API } from "../config";

const IDE = ({ homeworkId, setSuccess, setError }) => {
    const [code, setCode] = useState("# Write your code here")
    const [output, setOutput] = useState('')
    const [isRunning, setIsRunning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const fetchCode = async() => {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_BASE_URL}/get-code`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ homeworkId })
            })

            const result = await response.json()

            if (response.ok) {
                setCode(result.code || "# Write your code here")
            } else {
                setOutput('Failed to fetch your code')
                console.log(result.error)
            }
        }

        fetchCode()
    }, [homeworkId])

    const handleRun = async() => {
        setIsRunning(true)
        setOutput('Running...')

        try {
            const respone = await fetch(`${PYTHON_RUN_API}`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code })
            }) 

            const data = await respone.json()
            if (data.error) {
                setOutput(data.error)
            } else {
                setOutput(data.output || 'No output returned')
            }
        } catch (error) {
            setOutput("Error running code.");
        } finally {
            setIsRunning(false)
        }
    }

    const handleSubmit = async() => {
        setIsSubmitting(true)
        setOutput('Submitting...')

        try {
            const token = localStorage.getItem('token')

            const respone = await fetch(`${API_BASE_URL}/submit-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code, homeworkId })
            })

            const result = await respone.json()
            if (respone.ok) {
                setSuccess(result.message)
                setOutput('Submitted')
            } else {
                setError(result.error)
            }
        } catch (error) {
            setError("Error submitting code.");
            console.log(error.nessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        // <div style={{ padding: "20px", fontFamily: "Arial" }}>
        //     <Editor
        //         height="300px"
        //         language="python"
        //         theme="vs-dark"
        //         value={code}
        //         onChange={(value) => setCode(value)}
        //     />
        //     <button onClick={handleRun}>
        //         Run Code
        //     </button>
        //     <button onClick={handleSubmit}>
        //         Submit Code
        //     </button>
        //     <h3>Output:</h3>
        //     <pre style={{ background: "#f4f4f4", padding: "10px", borderRadius: "5px" }}>
        //         {output}
        //     </pre>
        // </div>
        <div className="ide-container">
            <Editor
                height="400px"
                language="python"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value)}
                className="code-editor"
                options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                }}
            />
            <div className="button-group">
                <button className="button button-primary" onClick={handleRun} disabled={isRunning}>
                <i className="material-icons">play_arrow</i>
                {isRunning ? "Running..." : "Run Code"}
                </button>
                <button className="button button-secondary" onClick={handleSubmit} disabled={isSubmitting}>
                <i className="material-icons">check_circle</i>
                {isSubmitting ? "Submitting..." : "Submit Solution"}
                </button>
            </div>
            <div className="output-section">
                <h3>Output:</h3>
                <pre className="output-display">{output}</pre>
            </div>
        </div>
    )
}

export default IDE