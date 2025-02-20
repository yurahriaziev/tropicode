import React from "react";
import Class from "./Class";
import Homework from "./Homework";
import HomeworkPreview from "./HomeworkPreview";

export default function Card({ card, upcomingClass, upcomingHomework }) {
    return (
        <>
        {card === 'upcoming-classes' ? (
            <div className='card-cont'>
                {/* title
                icon
                One upcomin class if there is one
                if Not
                show 'No upcoming classes' */}
                <h2>
                    <span className="material-icons">school</span>
                    <span>Upcoming Classes</span>
                    </h2>
                    {upcomingClass ? (
                        <Class classData={upcomingClass} view='student' />
                    ) : (
                        <h3>No upcoming classes! Yay</h3>
                    )}
            </div>
        ) : (
            <div>
                <h2>
                    <span className="material-icons">assignment</span>
                    <span>Your Homework</span>
                </h2>
                {upcomingHomework.length > 0 ? (
                    <HomeworkPreview homework={upcomingHomework[0]}/>
                ) : (
                    <h3>No homework! WooHoo!</h3>
                )}
            </div>
        )}
        </>
    )
}