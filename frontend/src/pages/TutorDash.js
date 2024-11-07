import React from "react";
import withAuth from "../withAuth";

function TutorDash() {
    return (
        <div className="admin-cont">
            <h1>Welcome Tutor</h1>
        </div>
    )
}

export default withAuth(TutorDash, 'tutor')