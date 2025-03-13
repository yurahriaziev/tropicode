import React, { useEffect, useState } from "react";
import Homework from "./Homework";

export default function StudentHomeworkList({ homeworks, setError, setSuccess }) {
    const [sortedHomework, setSortedHomework] = useState([])

    useEffect(() => {
        const sortByDate = () => {
            const sorted = [...homeworks].sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
            setSortedHomework(sorted)
        }

        sortByDate()
    }, [homeworks])

    // console.log(homeworks)
    return (
        <div>
            {sortedHomework.length > 0 ? (
                <ul>
                    {sortedHomework.map((homeworkData, index) => (
                        <Homework key={index} homeworkData={homeworkData} view='student' setError={setError} setSuccess={setSuccess} />
                    ))}
                </ul>
            ) : (
                <p>No assigned homework yet.</p>
            )}
        </div>
    )
}