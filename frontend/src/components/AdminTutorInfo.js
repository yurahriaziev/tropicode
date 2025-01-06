import React from "react";

export default function AdminTutorInfo({ tutors, handleRemoveTutor }) {
    return (
        <>
            <h1>Tutors</h1>
            <ul>
                {tutors.map((tutor, index) => (
                    <li key={index} style={{ marginBottom: '10px' }}>
                        <p><strong>Name:</strong> {tutor.first} {tutor.last} | <strong>Code:</strong> {tutor.join_code}</p>
                        <p><strong>Email:</strong> {tutor.email}</p>
                        <p><strong>Age:</strong> {tutor.age}</p>
                        <p><strong>Subjects Taught:</strong> {tutor.teaches}</p>
                        <button onClick={() => handleRemoveTutor(tutor.id)}>Remove</button>
                    </li>
                ))}
            </ul>
        </>
    )
}