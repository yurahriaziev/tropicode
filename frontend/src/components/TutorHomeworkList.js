import React from "react";

export default function TutorHomeworkList({ assignedHomework }) {
    return (
        <div>
            {assignedHomework.length > 0 ? (
                <ul>
                    
                </ul>
            ) : (
                <p>No assigned homework yet.</p>
            )}
        </div>
    )
}