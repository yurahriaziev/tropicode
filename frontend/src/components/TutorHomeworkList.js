import React from "react";
import Homework from "./Homework";

export default function TutorHomeworkList({ assignedHomework, handleRemoveHomework, setError }) {
    return (
        <div>
            {assignedHomework.length > 0 ? (
                <ul>
                    {assignedHomework.map((homeworkData, index) => (
                        <Homework key={index} index={index} homeworkData={homeworkData} view='tutor' handleRemoveHomework={handleRemoveHomework} setError={setError} />
                    ))}
                </ul>
            ) : (
                <p>No assigned homework yet.</p>
            )}
        </div>
    )
}