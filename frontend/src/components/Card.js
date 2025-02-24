import React, { useEffect, useState } from "react";
import Class from "./Class";
import HomeworkPreview from "./HomeworkPreview";

export default function Card({ card, upcomingClass, upcomingHomework }) {
    const [numToDo, setNumToDo] = useState(0)
    const [loadingClass, setLoadingClass] = useState(null)
    const [loadingHomework, setLoadingHomework] = useState(null)

    useEffect(() => {
        if (upcomingHomework === undefined) {
            setLoadingHomework(true)
        } else {
            setNumToDo(upcomingHomework.length);
            setLoadingHomework(false)
        }
    }, [upcomingHomework])

    useEffect(() => {
        if (upcomingClass === undefined) {
            setLoadingClass(true)
        } else {
            setLoadingClass(false)
        }
    }, [upcomingClass])

    return (
        <>
        {card === 'upcoming-classes' ? (
            <div className='card-cont'>
                <h2>
                    <span className="material-icons">school</span>
                    <span>Upcoming Class</span>
                </h2>
                {loadingClass === null || loadingClass === true ? (
                    <h3>Loading...</h3>
                ) : upcomingClass && Object.keys(upcomingClass).length > 0 ? (
                    <Class classData={upcomingClass} view='student' />
                ) : (
                    <h3>No upcoming classes! Yay</h3>
                )}
            </div>
        ) : (
            <div>
                <div className="card-header">
                    <h2>
                        <span className="material-icons">assignment</span>
                        <span>Your Homework</span>
                    </h2>
                    {numToDo > 0 && (
                        <p>{numToDo} To Do</p>
                    )}
                </div>
                {loadingHomework === null || loadingHomework === true ? (
                    <h3>Loading...</h3>
                ) : upcomingHomework && upcomingHomework.length > 0 ? (
                    <HomeworkPreview homework={upcomingHomework[0]} />
                ) : (
                    <h3>No homework! WooHoo!</h3>
                )}
            </div>
        )}
        </>
    )
}