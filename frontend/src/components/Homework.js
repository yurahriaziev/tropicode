import React from "react";
import { DateTime } from "luxon";

export default function Homework({ index, homeworkData, view }) {
    function formatTimeToEST(time) {
        time = time.split('T')[1]
        const utcTime = DateTime.fromISO(time, {zone: "utc"})
        const estTime = utcTime.setZone("America/New_York")
        return estTime.toFormat("hh:mma")
    }

    return (
        <>
            {view === 'tutor' ? (
                <div key={index}>
                    <p>Title</p>
                    <h3>{homeworkData.title}</h3>
                    <p>Due: {formatTimeToEST(homeworkData.dueDate)}</p>
                </div>
            ) : (
                <>
                </>
            )}
        </>
    )
}