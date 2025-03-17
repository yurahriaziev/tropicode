import React, { useState } from "react";

export default function NewHomeworkForm({ handleAddHomeworkClick, handleAddHomework, setError, setSuccess, studId }) {
    const [title, setTitle] = useState('')
    const [desc, setDesc] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [endTime, setEndTime] = useState('')
    const [isCoding, setIsCoding] = useState(false)
    const [showTestCases, setShowTestCases] = useState(false)
    const [testCases, setTestCases] = useState([])

    const endTimeOptions = []
    for (let hour = 17; hour <= 22; hour++) {
        for (let min = 0; min < 60; min+=30) {
            if (hour === 22 && min > 0) break
            const formatedTime = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`
            endTimeOptions.push(formatedTime)
        }
    }

    const handleEndTimeChange = (e) => {
        setEndTime(e.target.value)
    }

    const formatTimeToISO = (time) => {
        const date = new Date(dueDate)
        const [hours, minutes] = time.split(":")
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
        date.setDate(date.getDate() + 1)
        return date.toISOString()
    }

    function displayStandardTime(time) {
        const [hours, minutss] = time.split(':').map(Number)
        const suffix = hours >= 12 ? 'PM' : 'AM'
        const standardHours = hours % 12 || 12

        return `${standardHours}:${minutss.toString().padStart(2, '0')}${suffix}`
    }

    const handleCodingCheckbox = () => {
        setIsCoding(!isCoding)
        if (!isCoding) {
            setShowTestCases(false)
            setTestCases([])
        }
    }

    const handleAddTestCases = () => {
        setShowTestCases(true)
    }

    const handleTestCaseChange = (index, field, value) => {
        const updatedTestCases = [...testCases]
        updatedTestCases[index][field] = value
        setTestCases(updatedTestCases)
    }

    const handleAddTestCase = () => {
        setTestCases([...testCases, {input: '', expectedOutput: ''}])
    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        if (!title || !desc || !endTime) {
            setError('Must provide all required fields')
            return
        }
        try {
            const formattedDueDateTime = formatTimeToISO(endTime)
            const homework = {
                title, 
                desc, 
                studId, 
                dueDate:formattedDueDateTime,
                testCases: isCoding ? testCases : []
            }
            console.log(homework)
            handleAddHomework(studId, homework)
            setSuccess('Homework assigned successfully')
            handleAddHomeworkClick(false, '')
        } catch (err) {
            setError("An error occurred while adding new homework.");
            console.log(err)
        }
    }

    return (
        <>
            <button onClick={() => handleAddHomeworkClick(false)}>Close</button>
            <form onSubmit={handleSubmit}>
                <input
                    type="text" 
                    placeholder="Title" 
                    value={title}
                    required={true}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="textarea" 
                    placeholder="Description" 
                    value={desc}
                    required={true}
                    onChange={(e) => setDesc(e.target.value)}
                    rows={5}
                    cols={50}
                />
                <div>
                    <label htmlFor="due-date-picker">Due Date:</label>
                    <input
                        type="date"
                        id="due-date-picker"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="start-time-picker">Due Time</label>
                    <select
                        id="end-time-picker"
                        value={endTime}
                        onChange={handleEndTimeChange}
                    >
                        <option value="">--Select Due Date Time--</option>
                        {endTimeOptions.map((time) => (
                            <option key={time} value={time}>
                                {displayStandardTime(time)}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Coding?</label>
                    <input
                        type="checkbox"
                        checked={isCoding}
                        onChange={handleCodingCheckbox}
                    />
                </div>
                {isCoding && !showTestCases && (
                    <button type="button" onClick={handleAddTestCases}>Add Test Cases</button>
                )}

                {showTestCases && (
                    <div>
                        <h4>Test Cases</h4>
                        {testCases.map((testCase, index) => (
                            <div key={index} style={{ marginBottom: "10px"}}>
                                <input
                                    type="text"
                                    placeholder="Input"
                                    value={testCase.input}
                                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Expected Output"
                                    value={testCase.expectedOutput}
                                    onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                                />
                            </div>
                        ))}
                        <button type="button" onClick={handleAddTestCase}>+</button>
                    </div>
                )}

                <button type="submit">Assign</button>
            </form>
        </>
    )
}