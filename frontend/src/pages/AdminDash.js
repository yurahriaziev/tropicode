import React from "react";
import withAuth from "../withAuth";

function AdminDash() {
    return (
        <div className="admin-cont">
            <h1>Welcome Admin</h1>
        </div>
    )
}

export default withAuth(AdminDash, 'admin')