import React from "react";
import Homework from "./Homework";

export default function TutorHomeworkList({ assignedHomework, handleRemoveHomework }) {
    return (
        <div>
            {assignedHomework.length > 0 ? (
                <ul>
                    {assignedHomework.map((homeworkData, index) => (
                        <Homework key={index} index={index} homeworkData={homeworkData} view='tutor' handleRemoveHomework={handleRemoveHomework} />
                    ))}
                </ul>
            ) : (
                <p>No assigned homework yet.</p>
            )}
        </div>
    )
}