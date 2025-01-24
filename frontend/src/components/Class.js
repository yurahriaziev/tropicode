import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";

export default function Class({ index, classData}) {
    const [joinActive, setJoinActive] = useState(false)

    useEffect(() => {
        const updateJoinState = () => {
            const currentTime = new Date()
            const startTime = new Date(classData.start)
            // console.log(currentTime)
            // console.log(startTime)
            const timeDiff = startTime - currentTime
            if (classData.status !== 'FINISHED') {
                setJoinActive((timeDiff <= 5 * 60 * 1000 && timeDiff > 0) || (currentTime > startTime))
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
                style={{color: classData.status === 'LIVE' ? 'red' : 'black',fontWeight: classData.status === 'LIVE' ? 'bold' : 'normal'}}
            >
                {classData.status}
            </p>
            <p>{classData.studentName}</p>
            <p><strong>Start: </strong>{formatTimeToEST(classData.start)}<strong>End: </strong>{formatTimeToEST(classData.end)}</p>
            {/* <p><strong>ID: </strong>{classData.class_id}</p> */}
        </li>
    )
}