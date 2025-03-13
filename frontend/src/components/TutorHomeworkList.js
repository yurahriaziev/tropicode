import React, { useEffect, useState } from "react";
import Homework from "./Homework";

export default function TutorHomeworkList({ assignedHomework, handleRemoveHomework, setError }) {
    const [sortedHomework, setSortedHomework] = useState([])

    useEffect(() => {
        const sortHomework = () => {
            const sorted = [...assignedHomework].sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
            setSortedHomework(sorted)
        }

        sortHomework()
    }, [assignedHomework])

    return (
        <div>
            {sortedHomework.length > 0 ? (
                <ul>
                    {sortedHomework.map((homeworkData, index) => (
                        <Homework key={index} index={index} homeworkData={homeworkData} view='tutor' handleRemoveHomework={handleRemoveHomework} setError={setError} />
                    ))}
                </ul>
            ) : (
                <p>No assigned homework yet.</p>
            )}
        </div>
    )
}