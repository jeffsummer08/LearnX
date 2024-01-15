import { useEffect, useState, useRef } from "react"
import AccessChecker from "../../components/functions/AccessChecker"
import { useParams } from "react-router-dom"
import Loading from "../../components/Loading"
import GetCourse from "../../components/functions/GetCourse"
import Container from "../../components/Container"
import Nav from "../../components/Nav"
import { Card, CardBody, CardFooter, Divider, Button, Modal, ModalContent, ModalBody, useDisclosure, ModalHeader, Input, Tooltip, Switch, Select, SelectItem } from "@nextui-org/react"
import { Gear, Pencil, PlusCircle, Trash } from "react-bootstrap-icons"
import client from "../../components/instance"
import { toast } from "react-toastify"
import GetLesson from "../../components/functions/GetLesson"
import Error from "./Error"

export default function Unit() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const disclosure = useDisclosure()
    const editDisclosure = useDisclosure()
    const addLessonDisclosure = useDisclosure()
    const deleteLessonDisclosure = useDisclosure()
    const editLessonDisclosure = useDisclosure()
    const editVideoDisclosure = useDisclosure()
    const [loading, setLoading] = useState(true)
    const [access, setAccess] = useState<number | null>(null)
    const [roles, setRoles] = useState<string[] | null>(null)
    const [name, setName] = useState<string | null>(null)
    const [courseData, setCourseData] = useState<any>(null)
    const [title, setTitle] = useState<string>("")
    const [alias, setAlias] = useState<string>("")
    const [creating, setCreating] = useState<boolean>(false)
    const [deleting, setDeleting] = useState<boolean>(false)
    const [target, setTarget] = useState<number>(-1)
    const [active, setActive] = useState<number>(0)
    const [published, setPublished] = useState<boolean>(false)
    const [lessonType, setLessonType] = useState<string>("article")
    const [publishing, setPublishing] = useState<boolean>(false)
    const [videoUrl, setVideoUrl] = useState<string>("")
    const [found, setFound] = useState<boolean>(true)
    const { courseId } = useParams()
    const toastId: any = useRef(null)
    useEffect(() => {
        AccessChecker(-1).then(async (res) => {
            if (res.code === 500) {
                window.location.assign("/error")
            } else {
                setAccess(res.data.level)
                if (res.data.role.length > 0) {
                    setRoles(res.data.role)
                }
                setName(res.data.firstName + " " + res.data.lastName)
                if (courseId) {
                    const course = await GetCourse(courseId)
                    if (course.error) {
                        setFound(false)
                    } else {
                        setCourseData(course.data)
                        setLoading(false)
                        console.log(course.data.units[0].lessons)
                    }
                } else {
                    window.location.assign("/courses")
                }
            }
        })
    }, [])

    const handleSubmit = async () => {
        try {
            setCreating(true)
            const response = await client.post("/content/create-unit", {
                title: title,
                url: alias,
                course_url: courseId
            })
            toast.success(response.data.msg)
        } catch (error: any) {
            console.error(error)
            toast.error(error.response.data.msg)
        }
    }

    const deleteUnit = async (index: number) => {
        setDeleting(true)
        try {
            const unitUrl = courseData.units[index].url
            const courseUrl = courseId
            await client.post("/content/delete-unit", {
                course_url: courseUrl,
                url: unitUrl
            })
            toast.success("Successfully deleted unit.")
        } catch (error: any) {
            toast.error(error.response.data.msg)
        }
    }

    const editUnit = async (index: number) => {
        setCreating(true)
        try {
            const unitUrl = courseData.units[index].url
            const courseUrl = courseId
            const response = await client.post("/content/edit-unit", {
                course_url: courseUrl,
                url: unitUrl,
                title: title,
                update_url: alias,
                isPublished: published,
            })
            toast.success(response.data.msg)
        } catch (error: any) {
            toast.error(error.response.data.msg)
        }
    }

    const createLesson = async (index: number) => {
        setCreating(true)
        try {
            const unitUrl = courseData.units[index].url
            const courseUrl = courseId
            console.log({
                course_url: courseUrl,
                unit_url: unitUrl,
                title: title,
                url: alias,
                type: lessonType
            })
            const response = await client.post("/content/create-lesson", {
                course_url: courseUrl,
                unit_url: unitUrl,
                title: title,
                url: alias,
                type: lessonType,
                markdown: "",
                questions: "",
                videoUrl: lessonType === "video" ? videoUrl : ""
            })
            toast.success(response.data.msg)
        } catch (error: any) {
            toast.error(error.response.data.msg)
        }
    }

    const deleteLesson = async (index: number) => {
        setDeleting(true)
        try {
            const unitUrl = courseData.units[active].url
            const courseUrl = courseId
            const lessonUrl = courseData.units[active].lessons[index].url
            await client.post("/content/delete-lesson", {
                course_url: courseUrl,
                unit_url: unitUrl,
                url: lessonUrl
            })
            toast.success("Successfully deleted lesson.")
        } catch (error: any) {
            toast.error(error.response.data.msg)
        }
    }

    const publishLesson = async (index: number, published: boolean) => {
        setPublishing(true)
        try {
            toastId.current = toast.loading(published ? "Unpublishing lesson..." : "Publishing lesson...")
            const unitUrl = courseData.units[active].url
            const courseUrl = courseId
            const lessonUrl = courseData.units[active].lessons[index].url
            const lesson = await GetLesson(courseId!, unitUrl, lessonUrl)
            console.log({
                course_url: courseUrl,
                unit_url: unitUrl,
                url: lessonUrl,
                title: lesson.data.title,
                update_url: lessonUrl,
                isPublished: !published,
                type: lesson.data.type,
                markdown: lesson.data.markdown,
                questions: lesson.data.questions,
                video_url: lesson.data.videoUrl,
            })
            await client.post("/content/edit-lesson", {
                course_url: courseUrl,
                unit_url: unitUrl,
                url: lessonUrl,
                title: lesson.data.title,
                update_url: lessonUrl,
                isPublished: !published,
                type: lesson.data.type,
                markdown: lesson.data.markdown,
                questions: lesson.data.questions,
                video_url: lesson.data.videoUrl,
            })
            const res = await GetCourse(courseId!)
            setCourseData(res.data)
            toast.update(toastId.current, {
                render: "Successfully updated lesson.",
                type: "success",
                isLoading: false,
                autoClose: 3000,
                onClose: () => {
                    toastId.current = null
                }
            })

        } catch (error: any) {
            toast.update(toastId.current, {
                render: error.response.data.msg,
                type: "error",
                isLoading: false,
                autoClose: 3000,
                onClose: () => {
                    toastId.current = null
                }
            })
        }
    }

    const editLesson = async (index: number) => {
        setCreating(true)
        try {
            const unitUrl = courseData.units[active].url
            const courseUrl = courseId
            const lessonUrl = courseData.units[active].lessons[index].url
            const lesson = await GetLesson(courseId!, unitUrl, lessonUrl)
            await client.post("/content/edit-lesson", {
                course_url: courseUrl,
                unit_url: unitUrl,
                url: lessonUrl,
                title: title,
                update_url: alias,
                isPublished: lesson.data.isPublished,
                type: lesson.data.type,
                markdown: lesson.data.markdown,
                questions: lesson.data.questions,
                videoUrl: lesson.data.videoUrl,
            })
            toast.success("Successfully edited lesson.")
        } catch (error: any) {
            toast.error(error.response.data.msg)
        }
    }

    const editVideo = async (index: number) => {
        setCreating(true)
        try {
            const unitUrl = courseData.units[active].url
            const courseUrl = courseId
            const lessonUrl = courseData.units[active].lessons[index].url
            const lesson = await GetLesson(courseId!, unitUrl, lessonUrl)
            await client.post("/content/edit-lesson", {
                course_url: courseUrl,
                unit_url: unitUrl,
                url: lessonUrl,
                title: lesson.data.title,
                update_url: lessonUrl,
                isPublished: lesson.data.isPublished,
                type: lesson.data.type,
                markdown: lesson.data.markdown,
                questions: lesson.data.questions,
                videoUrl: videoUrl,
            })
            toast.success("Successfully edited video.")
        } catch (error: any) {
            toast.error(error.response.data.msg)
        }
    }

    if (loading) {
        return <Loading />
    } else if (!found) {
        return <Error type="404" />
    } else {
        return (
            <Container>
                <Nav role={roles} name={name} />
                <div className="flex flex-col-reverse md:flex-row w-full h-full overflow-hidden">
                    <div aria-label="side-menu" className="h-[250px] md:h-full flex justify-center md:w-1/5 border border-r-gray-200 overflow-y-auto">
                        <div className="w-5/6 mt-5 gap-y-5 flex flex-col items-start pb-2">
                            <h1 className="text-lg md:text-lg lg:text-2xl">{courseData.title}</h1>
                            <Divider />
                            {
                                courseData.units && courseData.units.length > 0 ? courseData.units.map((item: any, index: number) => (
                                    <div className="font-bold select-none cursor-pointer w-full flex flex-row items-center justify-between" key={index} onClick={() => {
                                        setActive(index)
                                    }} style={{ color: "inherit" }}>
                                        {
                                            access && access >= 2 ? (
                                                <>
                                                    <p className="w-[calc(75%)] whitespace-nowrap overflow-hidden overflow-ellipsis" style={{
                                                        color: index === active ? "#006FEE" : "inherit"
                                                    }}>{item.title}</p>
                                                    <Tooltip content="Edit Unit" placement="top" color="primary" closeDelay={0} size="sm">
                                                        <Pencil className="hover:text-primary" onClick={() => {
                                                            setTitle(item.title)
                                                            setAlias(item.url)
                                                            setPublished(item.isPublished)
                                                            setTarget(index)
                                                            editDisclosure.onOpen()
                                                        }} />
                                                    </Tooltip>
                                                    <Tooltip content="Delete Unit" placement="top" color="danger" closeDelay={0} size="sm">
                                                        <Trash className="hover:text-danger" onClick={() => {
                                                            setTarget(index)
                                                            disclosure.onOpen()
                                                        }} />
                                                    </Tooltip>
                                                </>
                                            ) : (
                                                <p className="w-[calc(100%)] whitespace-nowrap overflow-hidden overflow-ellipsis" style={{
                                                    color: index === active ? "#006FEE" : "inherit"
                                                }}>{item.title}</p>
                                            )
                                        }
                                    </div>
                                )) : (
                                    <></>
                                )
                            }
                            {
                                access && access >= 2 ? (
                                    <Button className="w-full min-h-unit-xl md:min-h-unit-sm" size="sm" onClick={onOpen}><PlusCircle />Add Unit</Button>
                                ) : (
                                    <></>
                                )
                            }
                        </div>
                    </div>
                    <div className="w-full lg:w-4/5 flex flex-col gap-y-5 p-10 overflow-y-auto">
                        {
                            access && access >= 2 && courseData.units[active] ? (
                                <div className="w-full pb-5">
                                    <Button onClick={() => {
                                        setTarget(active)
                                        addLessonDisclosure.onOpen()
                                    }} className="w-full">Add Lesson</Button>
                                </div>
                            ) : (
                                <></>
                            )
                        }
                        {
                            courseData.units[active] && courseData.units[active].lessons.map((item: any, index: number) => (
                                <Card key={index} className="flex-shrink-0">
                                    <CardBody className="p-5">
                                        <p>{item.type === "article" ? `Lesson:` : item.type === "video" ? "Video:" : "Assessment:"}</p>
                                        <p className="text-2xl">{item.title}</p>
                                    </CardBody>
                                    <CardFooter className="flex justify-end gap-x-3">
                                        {
                                            access && access >= 2 ? (
                                                <>
                                                    <Switch isDisabled={publishing} isSelected={item.isPublished} size="sm" onClick={() => {
                                                        publishLesson(index, item.isPublished).then(() => {
                                                            setPublishing(false)
                                                        })
                                                    }}>
                                                        {item.isPublished ? "Published" : "Not Published"}
                                                    </Switch>
                                                    <Tooltip content="Lesson Settings" closeDelay={0} size="sm">
                                                        <Gear className="cursor-pointer" onClick={() => {
                                                            setTarget(index)
                                                            setTitle(item.title)
                                                            setAlias(item.url)
                                                            editLessonDisclosure.onOpen()
                                                        }} />
                                                    </Tooltip>
                                                    <Tooltip content="Edit Lesson" color="primary" closeDelay={0} size="sm">
                                                        <Pencil className="hover:text-primary cursor-pointer" onClick={() => {
                                                            if (item.type === "article") {
                                                                window.location.assign(`/courses/${courseId}/unit/${courseData.units[active].url}/lesson/${item.url}/edit`)
                                                            } else if (item.type === "quiz") {
                                                                window.location.assign(`/courses/${courseId}/unit/${courseData.units[active].url}/quiz/${item.url}/edit`)
                                                            } else if (item.type === "video") {
                                                                editVideoDisclosure.onOpen()
                                                            }
                                                        }} />
                                                    </Tooltip>
                                                    <Tooltip content="Delete Lesson" color="danger" closeDelay={0} size="sm">
                                                        <Trash className="hover:text-danger cursor-pointer" onClick={() => {
                                                            setTarget(index)
                                                            deleteLessonDisclosure.onOpen()
                                                        }} />
                                                    </Tooltip>
                                                </>
                                            ) : (
                                                <></>
                                            )
                                        }
                                        <Button color="primary" onClick={() => {
                                            if (item.type === "article") {
                                                window.location.assign(`/courses/${courseId}/unit/${courseData.units[active].url}/lesson/${item.url}`)
                                            } else if (item.type === "quiz") {
                                                window.location.assign(`/courses/${courseId}/unit/${courseData.units[active].url}/quiz/${item.url}`)
                                            } else if (item.type === "video") {
                                                window.location.assign(`/courses/${courseId}/unit/${courseData.units[active].url}/video/${item.url}`)
                                            }
                                        }}>Go to Lesson</Button>
                                    </CardFooter>
                                </Card>
                            ))
                        }
                    </div>
                </div>
                <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={!creating} hideCloseButton={creating} onClose={() => {
                    setAlias("")
                    setTitle("")
                    setCreating(false)
                }}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Add Unit</ModalHeader>
                                <ModalBody className="pb-5">
                                    <Input value={title} placeholder="Enter Unit Title" variant="bordered" labelPlacement="outside" label="Unit Title" onChange={(e) => {
                                        setTitle(e.target.value)
                                        setAlias(e.target.value.toLowerCase().trim().replace(/ /g, "-"))
                                    }} />
                                    <Input value={alias} placeholder="Enter Alias" variant="bordered" labelPlacement="outside" label="Alias" onChange={(e) => {
                                        setAlias(e.target.value)
                                    }} />
                                    <Button isDisabled={title.length === 0 || alias.length === 0} color="primary" isLoading={creating} onClick={() => {
                                        handleSubmit().then(() => {
                                            GetCourse(courseId!).then((res) => {
                                                setCourseData(res.data)
                                                onClose()
                                            })
                                        })
                                    }}>
                                        {creating ? "" : "Add Unit"}
                                    </Button>
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                <Modal isOpen={addLessonDisclosure.isOpen} onOpenChange={addLessonDisclosure.onOpenChange} isDismissable={!creating} hideCloseButton={creating} onClose={() => {
                    setAlias("")
                    setTitle("")
                    setCreating(false)
                    setTarget(-1)
                    setLessonType("article")
                    setVideoUrl("")
                }}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Add Lesson</ModalHeader>
                                <ModalBody className="pb-5">
                                    <Input value={title} placeholder="Enter Lesson Title" variant="bordered" labelPlacement="outside" label="Lesson Title" onChange={(e) => {
                                        setTitle(e.target.value)
                                        setAlias(e.target.value.toLowerCase().trim().replace(/ /g, "-"))
                                    }} />
                                    <Input value={alias} placeholder="Enter Alias" variant="bordered" labelPlacement="outside" label="Alias" onChange={(e) => {
                                        setAlias(e.target.value)
                                    }} />
                                    <Select label="Lesson Type" variant="bordered" labelPlacement="outside" defaultSelectedKeys={["article"]} onChange={(e) => {
                                        console.log(e.target.value)
                                        setLessonType(e.target.value)
                                    }}>
                                        <SelectItem key="article" value="article">Article</SelectItem>
                                        <SelectItem key="video" value="video">Video</SelectItem>
                                        <SelectItem key="quiz" value="quiz">Quiz</SelectItem>
                                    </Select>
                                    {
                                        lessonType === "video" ? (
                                            <Input value={videoUrl} placeholder="Enter Video URL" variant="bordered" labelPlacement="outside" label="Video URL" onChange={(e) => {
                                                setVideoUrl(e.target.value)
                                            }} />
                                        ) : (
                                            <></>
                                        )
                                    }
                                    <Button isDisabled={title.length === 0 || alias.length === 0 || (videoUrl.length === 0 && lessonType === "video" && !videoUrl.includes("embed"))} color="primary" isLoading={creating} onClick={() => {
                                        createLesson(target).then(() => {
                                            GetCourse(courseId!).then((res) => {
                                                setCourseData(res.data)
                                                onClose()
                                            })
                                        })
                                    }}>
                                        {creating ? "" : "Add Lesson"}
                                    </Button>
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                <Modal isOpen={editDisclosure.isOpen} onOpenChange={editDisclosure.onOpenChange} isDismissable={!creating} hideCloseButton={creating} onClose={() => {
                    setAlias("")
                    setTitle("")
                    setCreating(false)
                    setPublished(false)
                }}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Edit Unit</ModalHeader>
                                <ModalBody className="pb-5 flex flex-col gap-y-5">
                                    <Input value={title} placeholder="Enter Unit Title" variant="bordered" labelPlacement="outside" label="Unit Title" onChange={(e) => {
                                        setTitle(e.target.value)
                                        setAlias(e.target.value.toLowerCase().trim().replace(/ /g, "-"))
                                    }} />
                                    <Input value={alias} placeholder="Enter Alias" variant="bordered" labelPlacement="outside" label="Alias" onChange={(e) => {
                                        setAlias(e.target.value)
                                    }} />
                                    <Switch isSelected={published} onChange={() => {
                                        setPublished(prevState => !prevState)
                                    }}>
                                        {published ? "Published" : "Not Published"}
                                    </Switch>
                                    <Button isDisabled={title.length === 0 || alias.length === 0} color="primary" isLoading={creating} onClick={() => {
                                        editUnit(target).then(() => {
                                            GetCourse(courseId!).then((res) => {
                                                setCourseData(res.data)
                                                onClose()
                                            })
                                        })
                                    }}>
                                        {creating ? "" : "Edit Unit"}
                                    </Button>
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                <Modal isOpen={editLessonDisclosure.isOpen} onOpenChange={editLessonDisclosure.onOpenChange} isDismissable={!creating} hideCloseButton={creating} onClose={() => {
                    setAlias("")
                    setTitle("")
                    setCreating(false)
                }}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Edit Lesson</ModalHeader>
                                <ModalBody className="pb-5 flex flex-col gap-y-5">
                                    <Input value={title} placeholder="Enter Lesson Title" variant="bordered" labelPlacement="outside" label="Lesson Title" onChange={(e) => {
                                        setTitle(e.target.value)
                                        setAlias(e.target.value.toLowerCase().trim().replace(/ /g, "-"))
                                    }} />
                                    <Input value={alias} placeholder="Enter Alias" variant="bordered" labelPlacement="outside" label="Alias" onChange={(e) => {
                                        setAlias(e.target.value)
                                    }} />
                                    <Button isDisabled={title.length === 0 || alias.length === 0} color="primary" isLoading={creating} onClick={() => {
                                        editLesson(target).then(() => {
                                            GetCourse(courseId!).then((res) => {
                                                setCourseData(res.data)
                                                onClose()
                                            })
                                        })
                                    }}>
                                        {creating ? "" : "Edit Lesson"}
                                    </Button>
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                <Modal isOpen={editVideoDisclosure.isOpen} onOpenChange={editVideoDisclosure.onOpenChange} isDismissable={!creating} hideCloseButton={creating} onClose={() => {
                    setVideoUrl("")
                    setCreating(false)
                }}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Edit Video</ModalHeader>
                                <ModalBody className="pb-5 flex flex-col gap-y-5">
                                    <Input value={videoUrl} placeholder="Enter Video Embed URL" variant="bordered" labelPlacement="outside" label="Video Embed URL" onChange={(e) => {
                                        setVideoUrl(e.target.value)
                                    }} />
                                    <Button isDisabled={videoUrl.length === 0 || !videoUrl.includes("embed")} color="primary" isLoading={creating} onClick={() => {
                                        editVideo(target).then(() => {
                                            GetCourse(courseId!).then((res) => {
                                                setCourseData(res.data)
                                                onClose()
                                            })
                                        })
                                    }}>
                                        {creating ? "" : "Edit Video"}
                                    </Button>
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                <Modal isOpen={disclosure.isOpen} isDismissable={!deleting} hideCloseButton={deleting} onOpenChange={disclosure.onOpenChange} onClose={() => {
                    setTarget(-1)
                    if (!(active === 0)) {
                        setActive(prevActive => prevActive - 1)
                    }
                    setDeleting(false)
                }}>
                    <ModalContent className="text-center">
                        {(onClose) => (
                            <>
                                <ModalBody className="py-5">
                                    <h1 className="text-lg font-bold">Delete Unit</h1>
                                    <p>Are you sure you want to delete this unit?</p>
                                    <Button color="danger" onClick={() => {
                                        deleteUnit(target).then(() => {
                                            GetCourse(courseId!).then((res) => {
                                                setCourseData(res.data)
                                                onClose()
                                            })
                                        })
                                    }} isLoading={deleting}>
                                        {deleting ? "" : "Delete Unit"}
                                    </Button>
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                <Modal isOpen={deleteLessonDisclosure.isOpen} isDismissable={!deleting} hideCloseButton={deleting} onOpenChange={deleteLessonDisclosure.onOpenChange} onClose={() => {
                    setTarget(-1)
                    setDeleting(false)
                }}>
                    <ModalContent className="text-center">
                        {(onClose) => (
                            <>
                                <ModalBody className="py-5">
                                    <h1 className="text-lg font-bold">Delete Lesson</h1>
                                    <p>Are you sure you want to delete this lesson?</p>
                                    <Button color="danger" onClick={() => {
                                        deleteLesson(target).then(() => {
                                            GetCourse(courseId!).then((res) => {
                                                setCourseData(res.data)
                                                onClose()
                                            })
                                        })
                                    }} isLoading={deleting}>
                                        {deleting ? "" : "Delete Lesson"}
                                    </Button>
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </Container>
        )
    }
}