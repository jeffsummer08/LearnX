import StudentDashboard from "../components/dashboard/Student"
import TeacherDashboard from "../components/dashboard/Teacher"
import { useState, useEffect } from "react"

export default function Dashboard() {
    const [accountType, setAccountType] = useState<"student" | "teacher" | "admin" | null>(null)
    useEffect(() => {
        // fetch account type
        setAccountType("teacher")
    }, [])
    if (accountType === "student") {
        return (
            <StudentDashboard />
        )
    } else if (accountType === "teacher") {
        return (
            <TeacherDashboard />
        )
    } else if (accountType === "admin") {
        return (
            <StudentDashboard />
        )
    } else {
        return (
            <StudentDashboard />
        )
    }
}