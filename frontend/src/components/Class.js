import React, { useEffect, useState } from "react";

export default function Class({ index, classData, view, handleRemoveClass}) {
    const [joinActive, setJoinActive] = useState(false)
    const [status, setStatus] = useState(classData.status)

    useEffect(() => {
        const updateJoinState = () => {
            const currentUTCTime = new Date()
            const utcStartDate = new Date(classData.start)
            const utcEndDate = new Date(classData.end)

            const fiveBefore = new Date(utcStartDate.getTime() - 5 * 60 * 1000)

            if (utcStartDate <= currentUTCTime && currentUTCTime <= utcEndDate) {
                setStatus('LIVE')
                setJoinActive(true)
            } else if (currentUTCTime >= fiveBefore && currentUTCTime < utcStartDate) {
                setStatus('UPCOMING')
                setJoinActive(true)
            } else if (currentUTCTime < utcStartDate) {
                setStatus('UPCOMING')
                setJoinActive(false)
            } else {
                setStatus('FINISHED')
                setJoinActive(false)
            }
        }

        updateJoinState()
        const interval = setInterval(updateJoinState, 1000)

        return () => clearInterval(interval)
    }, [classData])

    function formatTimeToEST(utcTimeString) { 
        const utcDate = new Date(utcTimeString)
        const utcToEstDate = utcDate.toLocaleString('en-US', {timeZone: 'America/New_York'})
        return utcToEstDate
    }

    function getPartDate(formatedESTDate, part) {
        if (part === 'date') {
            return formatedESTDate.split(',')[0]
        } else if (part === 'time') {
            return formatedESTDate.split(', ')[1]
        }
    }

    return (
        <>
            {view === 'student' ? (
                <div key={index}>
                    <p>{classData.title}
                        <button disabled={!joinActive}>
                            {joinActive ? (
                                <a
                                    href={classData.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{color: joinActive ? "inherit":"gray"}}
                                >
                                    Join class
                                </a>
                            ) : (
                                "Join class"
                            )}
                        </button>
                    </p>
                    <p
                        className="class-status"
                        style={{color: status === 'LIVE' ? 'red' : 'black',fontWeight: status === 'LIVE' ? 'bold' : 'normal'}}
                    >
                        {status}
                    </p>
                    <p>{classData.studentName}</p>
                    <p><strong>Start: </strong>{formatTimeToEST(classData.start)}<strong>End: </strong>{formatTimeToEST(classData.end)}</p>
                </div>

            ) : (
                <div key={index}>
                    <p>{classData.title}</p>
                    <p className="class-status" style={{color: status === 'LIVE' ? 'red' : 'black',fontWeight: status === 'LIVE' ? 'bold' : 'normal'}}
                        >{status}</p>
                    <a href={classData.link} target="_blank" rel="noopener noreferrer">
                        {classData.link}
                    </a>
                    <p>{classData.studentName}</p>
                    <p>
                        <strong>Date: </strong>{getPartDate(formatTimeToEST(classData.start), 'date')}
                    </p>
                    <p><strong>Start: </strong>{getPartDate(formatTimeToEST(classData.start), 'time')} | <strong>End: </strong>{getPartDate(formatTimeToEST(classData.end), 'time')}</p>
                    <p>{classData.class_id}</p>
                    <button onClick={() => handleRemoveClass(classData.class_id, classData.student_id)}>Remove</button>
                </div>
            )}
        </>

    )
}