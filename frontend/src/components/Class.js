import React from "react";

export default function Class({ index, classData}) {
    return (
        <li key={index}>
            <p>{classData.title}</p>
            <a href={classData.link} target="_blank" rel="noopener noreferrer">
                {classData.link}
            </a>
            <p>{classData.studentName}</p>
            <p><strong>Start: </strong>{classData.start} | <strong>End: </strong>{classData.end}</p>
            <p>{classData.class_id}</p>
        </li>
    )
}