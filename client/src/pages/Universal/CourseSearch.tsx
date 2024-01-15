import Container from "../../components/Container"
import Nav from "../../components/Nav"
import { useEffect, useState } from "react"
import AccessChecker from "../../components/functions/AccessChecker"
import Loading from "../../components/Loading"
import { Input, Card, CardHeader, CardFooter, CardBody, Button } from "@nextui-org/react"
import GetCourseList from "../../components/functions/GetCourseList"
import { Search } from "react-bootstrap-icons"

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
                <Nav role={role} name={name} active={0} />
                <div className="w-full h-full overflow-y-auto p-5 flex flex-col items-center">
                    <Input className="w-full md:w-3/4 lg:w-1/2" variant="bordered" placeholder="Search through our courses!" startContent={<Search />} onChange={(e) => {
                        setSearchQuery(e.target.value)
                    }} />
                    <div className="mt-10 w-full">
                        {
                            courseList.filter(p => p.title.includes(searchQuery)).map((course, index) => (
                                <Card key={index} className="w-full lg:w-[32%] h-[400px] pb-5">
                                    <CardHeader className="w-full flex flex-row justify-center h-1/2">
                                        <img alt="thumbnail" src={course.thumbnail} className="rounded-xl object-cover w-full h-full" />
                                    </CardHeader>
                                    <CardBody className="w-full h-full px-5">
                                        <div className="flex flex-row gap-x-2 items-center">
                                            <h1 className="text-xl">{course.title}</h1>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2 overflow-hidden overflow-ellipsis">{course.description}</p>
                                    </CardBody>
                                    <CardFooter>
                                        <Button className="w-full" color='primary' onClick={() => {
                                            window.location.assign(`/courses/${course.url}`)
                                        }}>Go to Course</Button>
                                    </CardFooter>
                                </Card>
                            ))
                        }
                    </div>
                </div>
            </Container>
        )
    }
}