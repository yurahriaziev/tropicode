import { DateTime } from "luxon";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomeworkPreview({ homework }) {
    function formatTimeToEST(time) {
            time = time.split('T')[1]
            const utcTime = DateTime.fromISO(time, {zone: "utc"})
            const estTime = utcTime.setZone("America/New_York")
            return estTime.toFormat("hh:mma")
        }

    const navigate = useNavigate()

    const handleTitleClick = () => {
        navigate(`/homework/${homework.id}`)
    }

    return (
        <div className="preview-cont">
            <h3 onClick={handleTitleClick}
                style={{cursor: 'pointer', textDecoration: 'none'}}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}>
                    {homework.title}
            </h3>
            <p>{formatTimeToEST(homework.dueDate)} {homework.dueDate.split('T')[0]}</p>
        </div>
    )
}