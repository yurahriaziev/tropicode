import React from "react";

export default function TutorStudentsList({ students }) {
    return (
        <>
            <table border="1" style={{ width: "80%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Age</th>
                    </tr>
                </thead>
                <tbody>
                    {students && students.length > 0 ? (
                        students.map((student, index) => (
                            <tr key={index}>
                                <td>{student.first}</td>
                                <td>{student.last}</td>
                                <td>{student.age}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" style={{ textAlign: "center" }}>
                                No students to display
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    )
}