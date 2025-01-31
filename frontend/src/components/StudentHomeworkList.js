import React from "react";
import Homework from "./Homework";

export default function StudentHomeworkList({ homeworks }) {
    return (
        <div>
            {homeworks.length > 0 ? (
                <ul>
                    {homeworks.map((homeworkData, index) => (
                        <Homework key={index} index={index} homeworkData={homeworkData} view='student' />
                    ))}
                </ul>
            ) : (
                <p>No assigned homework yet.</p>
            )}
        </div>
    )
}