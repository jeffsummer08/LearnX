import { useEffect, useState } from "react"
import getUser from "../components/functions/GetUser"
import { useParams } from "react-router-dom"
import validate from "../components/functions/Validate"
import Loading from "../components/Loading"
import Error from "./Error"
import StudentDashboard from "../components/dashboard/Student"
import TeacherDashboard from "../components/dashboard/Teacher"
import AdminDashboard from "../components/dashboard/Admin"
import Container from "../components/Container"
import Nav from "../components/Nav"

export default function Dashboard() {
    const { role } = useParams()
    const [userRole, setUserRole] = useState<string[] | string | null>(null)
    const [valid, setValid] = useState<boolean | null>(null)
    const [name, setName] = useState<string | null>(null)
    useEffect(() => {
        if (role) {
            let requiredLevel = 0
            switch (role) {
                case "student":
                    requiredLevel = 0
                    break
                case "teacher":
                    requiredLevel = 1
                    break
                case "staff":
                    requiredLevel = 2
                    break
                default:
                    setUserRole("404")
                    setValid(true)
                    return
            }
            validate(requiredLevel).then((res) => {
                setUserRole(res.data.role)
                setName(`${res.data.firstName} ${res.data.lastName}`)
                if (res.code === 200) {
                    setValid(true)
                } else if (res.code === 403) {
                    setValid(false)
                } else if (res.code === 500) {
                    window.location.replace("/error")
                } else if (res.code === 401) {
                    window.location.replace("/login")
                } else {
                    window.location.replace("/error")
                }
            }).catch((error) => {
                console.error(error)
                window.location.replace("/error")
            })
        } else {
            getUser().then((user) => {
                if (user.isAuthenticated) {
                    if (user.isSuperuser || user.isStaff) {
                        window.location.replace("/dashboard/staff")
                    } else if (user.isTeacher) {
                        window.location.replace("/dashboard/teacher")
                    } else {
                        window.location.replace("/dashboard/student")
                    }
                } else {
                    window.location.replace("/login")
                }
            }).catch((error) => {
                console.error(error)
                window.location.replace("/error")
            })
        }
    }, [])
    if (userRole === null || valid === null) {
        return <Loading />
    } else if (valid === false) {
        return <Error type="403" />
    } else if (userRole === "404") {
        return <Error type="404" />
    } else if (valid && userRole) {
        return (
            <Container>
                <Nav role={userRole as string[]} name={name} />
                {
                    role === "student" ? <StudentDashboard /> : role === "teacher" ? <TeacherDashboard /> : role === "staff" ? <AdminDashboard /> : "hello"
                }
            </Container>
        )
    }
}