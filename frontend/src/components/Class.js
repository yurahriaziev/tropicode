import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";

export default function Class({ index, classData, view, handleRemoveClass}) {
    const [joinActive, setJoinActive] = useState(false)
    const [status, setStatus] = useState(classData.status)

    function formatTimeToEST(utcTimeString) { // GETS FULL FORMATED DATE
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
                        <strong>Date: </strong>{getPartDate(formatTimeToEST(classData.start), 'date')}
                    </p>
                    <p><strong>Start: </strong>{getPartDate(formatTimeToEST(classData.start), 'time')} | <strong>End: </strong>{getPartDate(formatTimeToEST(classData.end), 'time')}</p>
                    <p>{classData.class_id}</p>
                    <button onClick={() => handleRemoveClass(classData.class_id, classData.student_id)}>Remove</button>
                </li>
            )}
        </>

    )
}