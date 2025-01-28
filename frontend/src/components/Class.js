import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";

export default function Class({ index, classData, view, handleRemoveClass}) {
    const [joinActive, setJoinActive] = useState(false)
    const [status, setStatus] = useState(classData.status)

    useEffect(() => {
        const updateJoinState = () => {
            const currentTime = new Date()
            const startTime = new Date(classData.start)
            const endTime = new Date(classData.end)

            const timeDiff = startTime - currentTime
            if (classData.status !== 'FINISHED') {
                setJoinActive((timeDiff <= 5 * 60 * 1000 && timeDiff > 0) || (currentTime > startTime))
            }

            if (currentTime >= startTime && currentTime <= endTime && classData.status !== 'LIVE') {
                setStatus('LIVE')
            } else if (currentTime > endTime && classData.status !== 'FINISHED') {
                setStatus('FINISHED')
            }
        }

        updateJoinState()
        const interval = setInterval(updateJoinState, 1000)

        return () => clearInterval(interval)
    }, [classData])

    function formatTimeToEST(time) {
        const utcTime = DateTime.fromISO(time, {zone: "utc"})
        const estTime = utcTime.setZone("America/New_York")
        return estTime.toFormat("hh:mma")
    }

    return (
        <>
            {view === 'student' ? (
                <li key={index}>
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
                </li>

            ) : (
                <li key={index}>
                    <p>{classData.title}</p>
                    <p className="class-status" style={{color: status === 'LIVE' ? 'red' : 'black',fontWeight: status === 'LIVE' ? 'bold' : 'normal'}}
                        >{status}</p>
                    <a href={classData.link} target="_blank" rel="noopener noreferrer">
                        {classData.link}
                    </a>
                    <p>{classData.studentName}</p>
                    <p>
                        <strong>Date: </strong>{classData.startDate}
                    </p>
                    <p><strong>Start: </strong>{formatTimeToEST(classData.start)} | <strong>End: </strong>{formatTimeToEST(classData.end)}</p>
                    <p>{classData.class_id}</p>
                    <button onClick={() => handleRemoveClass(classData.class_id, classData.student_id)}>Remove</button>
                </li>
            )}
        </>

    )
}