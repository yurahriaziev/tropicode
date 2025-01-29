import React, { useState } from "react";

export default function NewClassForm({ handleNewClassClick, setError, createNewMeeting, students }) {
    const [title, setTitle] = useState('')
    const [date, setDate] = useState('')
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [assignedStudent, setAssignedStudent] = useState("")

    const handleStartTimeChange = (e) => {
        setStartTime(e.target.value)
    }
    const handleEndTimeChange = (e) => {
        setEndTime(e.target.value)
    }

    const handleAssignedStudentChange = (e) => {
        setAssignedStudent(e.target.value)
    }

    const formatToUTC = (date, time) => {
        const estDate = new Date(`${date}T${time}:00-05:00`)
        const utcDateString = estDate.toISOString()
        return utcDateString
    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        if (!startTime || !endTime) {
            setError('Select both, start and end times.')
            return
        }

        if (startTime >= endTime) {
            setError('Start and end must differ')
            return
        }

        try {
            const utcStartDate = formatToUTC(date, startTime)
            const utcEndDate = formatToUTC(date, endTime)

            await createNewMeeting(title, utcStartDate, utcEndDate, assignedStudent)
        } catch (err) {
            setError(`An error occurred while creating the meeting. ${err}`);
        }
    }

    // for debugging
    const startTimeOptions = []
    for (let hour = 16; hour <= 18; hour++) {
        for (let min = 0; min < 60; min+=1) {
            if (hour === 18 && min > 0) break
            const formatedTime = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`
            startTimeOptions.push(formatedTime)
        }
    }
    const endTimeOptions = []
    for (let hour = 17; hour <= 19; hour++) {
        for (let min = 0; min < 60; min+=1) {
            if (hour === 19 && min > 0) break
            const formatedTime = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`
            endTimeOptions.push(formatedTime)
        }
    }

    function displayStandardTime(time) {
        const [hours, minutss] = time.split(':').map(Number)
        const suffix = hours >= 12 ? 'PM' : 'AM'
        const standardHours = hours % 12 || 12

        return `${standardHours}:${minutss.toString().padStart(2, '0')}${suffix}`
    }

    return (
        <div className="class-form-cont">
            <button onClick={() => handleNewClassClick(false)}>Close</button>
            <div className="class-form-title">
                Create a new class.
            </div>
            <div className="class-form">
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Class Title"
                        value={title}
                        required={true}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <div>
                        <label htmlFor="due-date-picker">Date:</label>
                        <input
                            type="date"
                            id="due-date-picker"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="start-time-picker">Start Time:</label>
                        <select
                            id="start-time-picker"
                            value={startTime}
                            onChange={handleStartTimeChange}
                        >
                            <option value="">--Select Start Time--</option>
                            {startTimeOptions.map((time) => (
                                <option key={time} value={time}>
                                    {displayStandardTime(time)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="start-time-picker">End Time:</label>
                        <select
                            id="end-time-picker"
                            value={endTime}
                            onChange={handleEndTimeChange}
                        >
                            <option value="">--Select End Time--</option>
                            {endTimeOptions.map((time) => (
                                <option key={time} value={time}>
                                    {displayStandardTime(time)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="assign-student-picker">Assign Student:</label>
                        <select
                            id="assign-student-picker"
                            value={assignedStudent}
                            onChange={handleAssignedStudentChange}
                        >
                            <option value="">--Select Student--</option>
                            {students.map((student, index) => (
                                <option key={index} value={student.id}>
                                    {student.first + ' ' + student.last}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">Create Class</button>
                </form>
            </div>
        </div>
    )
}