import React from "react";

export default function TutorStudentsList({ students, handleRemoveStudent }) {
    return (
        <>
            <table border="1" style={{ width: "80%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Age</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {students && students.length > 0 ? (
                            students.map((student, index) => (
                                <tr key={index}>
                                    <td>{student.first}</td>
                                    <td>{student.last}</td>
                                    <td>{student.age}</td>
                                    <td><button onClick={() => handleRemoveStudent(student.id)}>Remove</button></td>
                                </tr>
                            ))
                       ) : (
                        <tr>
                            <td colSpan="3" style={{ textAlign: "center" }}>
                                No Students Yet
                            </td>
                        </tr>
                       )}
                </tbody>
            </table>
        </>
    )
}