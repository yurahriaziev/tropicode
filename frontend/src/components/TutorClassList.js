import React, { useEffect, useState } from "react";
import Class from "./Class";

export default function TutorClassList({ upcomingClasses, handleRemoveClass }) {
    // filter classes by date, closest to start go first
    const [filteredClasses, setFilteredClasses] = useState([])

    
    useEffect(() => {
        const filterByDate = () => {
            const now = new Date()

            const sortedClasses = [...upcomingClasses].sort((a, b) => {
                const dateA = new Date(a.start)
                const dateB = new Date(b.start)

                if (isNaN(dateA.getTime())) return 1
                if (isNaN(dateB.getTime())) return -1

                if (dateA >= now && dateB >= now) return dateA - dateB
                if (dateA < now && dateB < now) return dateB - dateA

                return dateA >= now ? -1 : 1
            })

            setFilteredClasses(sortedClasses)
        }

        const today = new Date().toISOString().split('T')[0]
        filterByDate(today)
    }, [upcomingClasses])

    return (
        <div className="class-list-cont">
            {filteredClasses.length > 0 ? (
                    <ul>
                        {filteredClasses.map((classData, index) => (
                            <Class key={index} index={index} classData={classData} view='tutor' handleRemoveClass={handleRemoveClass} />
                        ))}
                    </ul>
                ) : (
                    <p>No upcoming classes yet.</p>
                )}
        </div>
    )
}