import { DateTime } from "luxon";
import React from "react";

export default function HomeworkPreview({ homework }) {
    function formatTimeToEST(time) {
            time = time.split('T')[1]
            const utcTime = DateTime.fromISO(time, {zone: "utc"})
            const estTime = utcTime.setZone("America/New_York")
            return estTime.toFormat("hh:mma")
        }

    return (
        <div className="preview-cont">
            <h3>{homework.title}</h3>
            <p>{formatTimeToEST(homework.dueDate)} {homework.dueDate.split('T')[0]}</p>
        </div>
    )
}