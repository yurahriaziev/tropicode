import React from "react";
import Homework from "./Homework";

export default function StudentHomeworkList({ homeworks, setError, setSuccess }) {
    return (
        <div>
            {homeworks.length > 0 ? (
                <ul>
                    {homeworks.map((homeworkData, index) => (
                        <Homework key={index} index={index} homeworkData={homeworkData} view='student' setError={setError} setSuccess={setSuccess} />
                    ))}
                </ul>
            ) : (
                <p>No assigned homework yet.</p>
            )}
        </div>
    )
}