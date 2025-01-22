import React from "react";

export default function TutorClassList({ upcomingClasses, handleRemoveClass }) {
    return (
        <div className="class-list-cont">
            {upcomingClasses.length > 0 ? (
                    <ul>
                        {upcomingClasses.map((classData, index) => (
                            <li key={index}>
                                <p>{classData.title}</p>
                                <p className="class-status" style={{color: classData.status === 'LIVE' ? 'red' : 'black',fontWeight: classData.status === 'LIVE' ? 'bold' : 'normal'}}
                                    >{classData.status}</p>
                                <a href={classData.link} target="_blank" rel="noopener noreferrer">
                                    {classData.link}
                                </a>
                                <p>{classData.studentName}</p>
                                <p><strong>Start: </strong>{classData.start} | <strong>End: </strong>{classData.end}</p>
                                <p>{classData.class_id}</p>
                                <button onClick={() => handleRemoveClass(classData.class_id, classData.student_id)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No upcoming classes yet.</p>
                )}
        </div>
    )
}