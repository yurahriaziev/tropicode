import React from "react";
import Class from "./Class";

export default function StudentClassList({ upcomingClasses }) {
    return (
        <div>
            {upcomingClasses.length > 0 ? (
                <ul>
                    {upcomingClasses.map((classData, index) => (
                        <Class key={index} index={index} classData={classData} />
                    ))}
                </ul>
            ) : (
                <p>No upcoming classes yet.</p>
            )}
        </div>
    )
}