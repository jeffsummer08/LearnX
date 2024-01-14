import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Loading from "../../components/Loading"
import Container from "../../components/Container"
import Nav from "../../components/Nav"
import AccessChecker from "../../components/functions/AccessChecker"
import GetLesson from "../../components/functions/GetLesson"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import GetCourse from "../../components/functions/GetCourse"
import { Divider } from "@nextui-org/react"
import { ChevronLeft } from "react-bootstrap-icons"

export default function Lesson() {
    const [loading, setLoading] = useState<boolean>(true)
    const [name, setName] = useState<string | null>(null)
    const [role, setRole] = useState<string[] | null>(null)
    const [content, setContent] = useState<any>(null)
    const [active, setActive] = useState<number>(0)
    const [courseData, setCourseData] = useState<any>(null)
    const { courseId, unitId, lessonId } = useParams()

    useEffect(() => {
        AccessChecker(-1).then((res) => {
            if (res.code === 200) {
                setName(`${res.data.firstName} ${res.data.lastName}`)
                setRole(res.data.role)
                GetCourse(courseId!).then((course) => {
                    setCourseData(course.data)
                    GetLesson(courseId!, unitId!, lessonId!).then((res: { error: boolean, data: any }) => {
                        if (res.error) {
                            window.location.assign("/error")
                        } else {
                            setContent(res.data)
                            setContent((prevState: any) => ({
                                ...prevState,
                                markdown: prevState.markdown.replace(/(<img("[^"]*"|[^\/">])*)>/gi, "$1/>")
                            }))
                            setActive(course.data.units[course.data.units.findIndex((i: any) => i.url === unitId)].lessons.findIndex((i: any) => i.url === lessonId))
                            setLoading(false)
                        }
                    })
                })
            } else if (res.code === 500) {
                window.location.assign("/error")
            }
        })
    }, [])

    if (loading) {
        return <Loading />
    } else {
        return (
            <Container>
                <Nav role={role} name={name} />
                <div className="flex flex-col-reverse md:flex-row w-full h-full overflow-hidden">
                    <div aria-label="side-menu" className="h-[300px] md:h-full flex justify-center md:w-1/5 border border-r-gray-200 overflow-y-auto">
                        <div className="w-5/6 mt-5 gap-y-5 flex flex-col items-start">
                            <div className="flex flex-col gap-y-1">
                                <p className="text-sm cursor-pointer select-none flex flex-row items-center gap-x-2" onClick={() => {
                                    window.location.assign(`/courses/${courseId}`)
                                }}><ChevronLeft />{courseData.title}</p>
                                <h1 className="text-lg md:text-lg lg:text-2xl">{courseData.units[courseData.units.findIndex((i: any) => i.url === unitId)].title}</h1>
                            </div>
                            <Divider />
                            {
                                courseData.units && courseData.units.length > 0 ? courseData.units[courseData.units.findIndex((i: any) => i.url === unitId)].lessons.map((item: any, index: number) => (
                                    <div className="font-bold select-none cursor-pointer w-full flex flex-col" key={index} onClick={() => {
                                        window.location.assign(`/courses/${courseId}/unit/${unitId}/lesson/${item.url}`)
                                    }} style={{
                                        color: index === active ? "#006FEE" : "inherit"
                                    }}>
                                        <p>Lesson {index + 1}:</p>
                                        <p className="w-[calc(100%)] whitespace-nowrap overflow-hidden overflow-ellipsis">{item.title}</p>
                                    </div>
                                )) : (
                                    <></>
                                )
                            }
                        </div>
                    </div>
                    <div className="w-full md:w-4/5 h-full max-h-full overflow-y-auto p-10">
                        <h1 className="pb-5">Lesson {active + 1}: {courseData.units[courseData.units.findIndex((i: any) => i.url === unitId)].lessons[active].title}</h1>
                        <Markdown rehypePlugins={[rehypeRaw]}>{content.markdown}</Markdown>
                    </div>
                </div>
            </Container>
        )
    }
}