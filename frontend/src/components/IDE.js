import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { PYTHON_RUN_API } from "../config";

const IDE = () => {
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
        <h3>Output:</h3>
        <pre style={{ background: "#f4f4f4", padding: "10px", borderRadius: "5px" }}>
            {output}
        </pre>
        </div>
    )
}

export default IDE