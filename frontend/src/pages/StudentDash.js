import React from "react";
import withAuth from "../withAuth";

function StudentDash() {
    return (
        <div className="admin-cont">
            <h1>Welcome Student</h1>
        </div>
    )
}

export default withAuth(StudentDash, 'student')