import React from "react";
import Class from "./Class";

export default function TutorClassList({ upcomingClasses, handleRemoveClass }) {
    return (
        <div className="class-list-cont">
            {upcomingClasses.length > 0 ? (
                    <ul>
                        {upcomingClasses.map((classData, index) => (
                            <Class key={index} index={index} classData={classData} view='tutor' handleRemoveClass={handleRemoveClass} />
                        ))}
                    </ul>
                ) : (
                    <p>No upcoming classes yet.</p>
                )}
        </div>
    )
}