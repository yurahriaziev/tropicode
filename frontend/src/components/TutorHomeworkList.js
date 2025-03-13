import React, { useEffect, useState } from "react";
import Homework from "./Homework";
import { DateTime } from "luxon";

export default function TutorHomeworkList({ assignedHomework, handleRemoveHomework, setError }) {
    const [sortedHomework, setSortedHomework] = useState([])

    useEffect(() => {
        const sortHomework = () => {
            const sorted = [...assignedHomework].sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
            setSortedHomework(sorted)
        }

        sortHomework()
    }, [assignedHomework])

    function formatTimeToEST(time) {
        time = time.split('T')[1]
        const utcTime = DateTime.fromISO(time, {zone: "utc"})
        const estTime = utcTime.setZone("America/New_York")
        return estTime.toFormat("hh:mma")
    }

    return (
        // <div>
        //     {sortedHomework.length > 0 ? (
        //         <ul>
        //             {sortedHomework.map((homeworkData, index) => (
        //                 <Homework key={index} index={index} homeworkData={homeworkData} view='tutor' handleRemoveHomework={handleRemoveHomework} setError={setError} />
        //             ))}
        //         </ul>
        //     ) : (
        //         <p>No assigned homework yet.</p>
        //     )}
        // </div>
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Due date</th>
                    <th>Student</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {sortedHomework.map((homework, index) => (
                    <tr key={index}>
                        <td>{homework.title}</td>
                        <td>{homework.dueDate.split('T')[0]}</td>
                        <td>{homework.studentName}</td>
                        <td>{homework.status}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}