import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { API_BASE_URL, PYTHON_RUN_API } from "../config";

const IDE = ({ homeworkId, setSuccess, setError }) => {
    const [code, setCode] = useState("# Write your code here")
    const [output, setOutput] = useState('')

    const handleRun = async() => {
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
        }
    }

    const handleSubmit = async() => {
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
        }
    }

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <Editor
            height="300px"
            language="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value)}
        />
        <button onClick={handleRun}>
            Run Code
        </button>
        <button onClick={handleSubmit}>
            Submit Code
        </button>
        <h3>Output:</h3>
        <pre style={{ background: "#f4f4f4", padding: "10px", borderRadius: "5px" }}>
            {output}
        </pre>
        </div>
    )
}

export default IDE