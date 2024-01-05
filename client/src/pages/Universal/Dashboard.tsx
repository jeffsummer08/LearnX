import { useEffect, useState } from "react"
import getUser from "../../components/functions/GetUser"
import { useParams } from "react-router-dom"
import AccessChecker from "../../components/functions/AccessChecker"
import Loading from "../../components/Loading"
import Error from "./Error"
import StudentDashboard from "../../components/dashboard/Student"
import TeacherDashboard from "../../components/dashboard/Teacher"
import AdminDashboard from "../../components/dashboard/Admin"
import Container from "../../components/Container"
import Nav from "../../components/Nav"


export default function Dashboard() {
    
    const { role } = useParams()
    const [userRole, setUserRole] = useState<string[] | "404" | null>(null)
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
            AccessChecker(requiredLevel).then((res) => {
                setUserRole(res.data.role)
                setName(`${res.data.firstName} ${res.data.lastName}`)
                if (res.code === 200) {
                    setValid(true)
                } else if (res.code === 403) {
                    setValid(false)
                } else if (res.code === 500) {
                    window.location.assign("/error")
                } else if (res.code === 401) {
                    window.location.assign("/login")
                } else {
                    window.location.assign("/error")
                }
            }).catch((error) => {
                console.error(error)
                window.location.assign("/error")
            })
        } else {
            getUser().then((user) => {
                if (user.isAuthenticated) {
                    if (user.isSuperuser || user.isStaff) {
                        window.location.assign("/dashboard/staff")
                    } else if (user.isTeacher) {
                        window.location.assign("/dashboard/teacher")
                    } else {
                        window.location.assign("/dashboard/student")
                    }
                } else {
                    window.location.assign("/login")
                }
            }).catch((error) => {
                console.error(error)
                window.location.assign("/error")
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