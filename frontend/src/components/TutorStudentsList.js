import React, {useState} from "react";
import NewHomeworkForm from "./NewHomeworkForm";

export default function TutorStudentsList({ students, handleRemoveStudent, handleAddHomework, setError, setSuccess }) {
    const [addHomeworkForm, setAddHomeworkForm] = useState(false)
    const [currectStudentHWID, setCurrentStudentHWID] = useState('')

    const handleAddHomeworkClick = (open, id) => {
        setAddHomeworkForm(open)
        setCurrentStudentHWID(id)
    }
    return (
        <>
            <table border="2" style={{ width: "50%", textAlign: "left", borderCollapse: "collapse" }}>
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
                                    <td>
                                        <button onClick={() => handleRemoveStudent(student.id)}>Remove</button>
                                        <button onClick={() => handleAddHomeworkClick(true, student.id)}>Add Homework</button>
                                    </td>
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
            {addHomeworkForm && (
                <div className="add-homework-form">
                    <NewHomeworkForm
                        handleAddHomeworkClick={handleAddHomeworkClick}
                        handleAddHomework={handleAddHomework}
                        setError={setError}
                        setSuccess={setSuccess}
                        studId={currectStudentHWID}
                    />
                </div>
            )}
        </>
    )
}