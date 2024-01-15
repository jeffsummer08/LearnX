import Container from "../../components/Container"
import Nav from "../../components/Nav"
import { useEffect, useState } from "react"
import AccessChecker from "../../components/functions/AccessChecker"
import Loading from "../../components/Loading"
import { Input } from "@nextui-org/react"
import GetCourseList from "../../components/functions/GetCourseList"

export default function CourseSearch() {
    const [loading, setLoading] = useState<boolean>(true)
    const [role, setRole] = useState<string[] | null>(null)
    const [name, setName] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [courseList, setCourseList] = useState<any[]>([])

    useEffect(() => {
        AccessChecker(-1).then((res) => {
            if (res.code === 200) {
                if (res.data.role.length > 0) {
                    setRole(res.data.role)
                }
                setName(`${res.data.firstName} ${res.data.lastName}`)
            }
            GetCourseList().then((res) => {
                if (res.error) {
                    window.location.assign("/error")
                } {
                    setCourseList(res.data)
                    setLoading(false)
                }
            })
        })
    }, [])

    if (loading) {
        return <Loading />
    } else {
        return (
            <Container>
                <Nav role={role} name={name} />
                <div className="w-full h-full overflow-y-auto">
                    <Input />
                </div>
            </Container>
        )
    }
}