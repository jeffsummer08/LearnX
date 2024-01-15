import Container from "../../components/Container"
import Nav from "../../components/Nav"
import { useState, useEffect, useRef } from "react"
import AccessChecker from "../../components/functions/AccessChecker"
import Loading from "../../components/Loading"
import Error from "../Universal/Error"
import TextEditor from "../../components/TextEditor"
import { MDXEditorMethods } from "@mdxeditor/editor"
import { useParams } from "react-router-dom"
import GetLesson from "../../components/functions/GetLesson"
import { Button, BreadcrumbItem, Breadcrumbs, Modal, ModalBody, ModalHeader, useDisclosure, ModalContent, ModalFooter } from "@nextui-org/react"
import GetCourse from "../../components/functions/GetCourse"
import client from "../../components/instance"
import { toast } from "react-toastify"

export default function EditLesson() {
    const [loading, setLoading] = useState(true)
    const [valid, setValid] = useState<boolean | null>(null)
    const editorRef = useRef<MDXEditorMethods>(null)
    const { courseId, unitId, lessonId } = useParams()
    const [lessonContent, setLessonContent] = useState<any>(null)
    const [originalContent, setOriginalContent] = useState<any>(null)
    const [name, setName] = useState<string | null>(null)
    const [role, setRole] = useState<string[] | null>(null)
    const [courseData, setCourseData] = useState<any>(null)
    const [lessonTitle, setLessonTitle] = useState<string>("")
    const [alias, setAlias] = useState<string>("")
    const [published, setPublished] = useState<boolean>(false)
    const warning = useDisclosure()
    useEffect(() => {
        AccessChecker(2).then((res) => {
            if (res.code === 200) {
                setValid(true)
                setRole(res.data.role)
                setName(`${res.data.firstName} ${res.data.lastName}`)
                if (courseId && unitId && lessonId) {
                    GetLesson(courseId!, unitId!, lessonId!).then((res: { data: any, error: boolean }) => {
                        if (res.error) {
                            window.location.assign("/error")
                        } else {
                            setLessonContent(res.data)
                            setLessonContent((prevState: any) => ({
                                ...prevState,
                                markdown: prevState.markdown.replace(/(<img("[^"]*"|[^\/">])*)>/gi, "$1/>")
                            }))
                            setLessonTitle(res.data.title)
                            setPublished(res.data.isPublished)
                            setAlias(lessonId)
                            setOriginalContent(res.data)
                            GetCourse(courseId!).then((res) => {
                                setCourseData(res.data)
                                setLoading(false)
                            })
                        }
                    })
                } else {

                }
            } else if (res.code === 401) {
                window.location.assign("/login")
            } else if (res.code === 500) {
                window.location.assign("/error")
            } else if (res.code === 403) {
                setValid(false)
            }
        })
    }, [])

    const getMarkdown = () => {
        return editorRef.current!.getMarkdown()
    }

    const saveLesson = async () => {
        let markdown = getMarkdown()
        setOriginalContent((prevState: any) => ({
            ...prevState,
            markdown: markdown
        }))
        try {
            toast.promise(
                client.post("/content/edit-lesson", {
                    type: "article",
                    markdown: markdown,
                    title: lessonTitle,
                    url: lessonId,
                    update_url: alias,
                    isPublished: published,
                    course_url: courseId,
                    unit_url: unitId
                }),
                {
                    pending: "Saving...",
                    success: "Successfully saved lesson!",
                    error: "An error occurred while saving the lesson."
                }
            )
        } catch (error: any) {
            console.error(error)
            toast.error(error.response.data.msg)
        }
    }

    if (loading) {
        return <Loading />
    } else if (valid === false) {
        return <Error type="403" />
    } else if (valid === true) {
        return (
            <Container>
                <Nav role={role!} name={name!} />
                <div className="flex flex-col p-10 w-full h-full">
                    <Breadcrumbs className="cursor-pointer select-none">
                        <BreadcrumbItem className="cursor-pointer select-none" onClick={() => {
                            if (originalContent.markdown !== getMarkdown()) {
                                warning.onOpen()
                            } else {
                                window.location.assign(`/courses/${courseId}`)
                            }
                        }}>
                            {
                                courseData.title
                            }
                        </BreadcrumbItem>
                        <BreadcrumbItem className="cursor-pointer select-none" onClick={() => {
                            if (originalContent.markdown !== getMarkdown()) {
                                warning.onOpen()
                            } else {
                                window.location.assign(`/courses/${courseId}`)
                            }
                        }}>
                            {
                                courseData.units.find((unit: any) => unit.url === unitId).title
                            }
                        </BreadcrumbItem>
                        <BreadcrumbItem className="cursor-pointer select-none">
                            {
                                lessonContent.title
                            }
                        </BreadcrumbItem>
                    </Breadcrumbs>
                    <div className="flex flex-col items-center justify-center w-full h-full max-h-full">
                        <h1>Edit Lesson</h1>
                        <div className="border border-gray-400 h-[90%] max-h-[90%] rounded-md mt-5 w-3/4 overflow-hidden textEditor">
                            <TextEditor markdown={lessonContent.markdown} editorRef={editorRef} />
                        </div>
                        <Button className="mt-5 w-3/4" color="primary" onClick={() => {
                            saveLesson()
                        }}>
                            Save
                        </Button>
                    </div>
                </div>
                <Modal isOpen={warning.isOpen} onOpenChange={warning.onOpenChange}>
                    <ModalContent>
                        <ModalHeader className="w-full flex flex-row justify-center">Warning</ModalHeader>
                        <ModalBody className="w-full flex flex-row justify-center">
                            <span>Are you sure you want to leave without saving?</span>
                        </ModalBody>
                        <ModalFooter className="w-full flex flex-row gap-x-2">
                            <Button color="primary" className="w-full" onClick={() => {
                                warning.onClose()
                            }}>
                                No, I want to stay
                            </Button>
                            <Button color="danger" className="w-full" onClick={() => {
                                window.location.assign(`/courses/${courseId}`)
                            }}>
                                Yes, I want to leave.
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Container>
        )
    }
}