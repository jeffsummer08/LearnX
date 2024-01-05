import { useEffect, useState } from "react"
import AccessChecker from "../../components/functions/AccessChecker"
import { useParams } from "react-router-dom"
import Loading from "../../components/Loading"
import GetCourse from "../../components/functions/GetCourse"
import Container from "../../components/Container"
import Nav from "../../components/Nav"

export default function Course() {
    const [loading, setLoading] = useState(true)
    const [access, setAccess] = useState<number | null>(null)
    const { courseId } = useParams()
    useEffect(() => {
        AccessChecker(-1).then(async (res) => {
            if (res.code === 500) {
                window.location.assign("/error")
            } else {
                setLoading(false)
                setAccess(res.data.level)
                if (courseId) {
                    const course = await GetCourse(courseId)
                    console.log(course)
                } else {
                    window.location.assign("/courses")
                }
            }
        })
    })

    if (loading) {
        return <Loading />
    } else {
        return (
            <Container>
                <Nav />
                <div className="flex flex-col items-center justify-center">
                    <p className="text-2xl">Course</p>
                </div>
            </Container>
        )
    }
}