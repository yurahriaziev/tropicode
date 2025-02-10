import React from "react";

export default function Game() {
    return (
        <div>
            <img 
                src="http://127.0.0.1:5001/video_feed"
                alt="Pygame Stream"
                style={{ width: "800px", height: "600px", border: "1px solid black" }}
            />
        </div>
    )
}