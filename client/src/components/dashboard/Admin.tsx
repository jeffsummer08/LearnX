import { useEffect, useState, useRef } from "react"
import { Card, CardBody, CardHeader, Modal, ModalBody, ModalHeader, Input, useDisclosure, ModalContent, Button, ModalFooter, Divider, Textarea, Switch } from "@nextui-org/react"
import { Pencil, PlusCircleFill, Trash, Upload } from "react-bootstrap-icons"
import Loading from "../Loading"
import GetCourseList from "../functions/GetCourseList"
import client from "../instance"
import { toast } from "react-toastify"

export default function AdminDashboard() {
    const [loading, setLoading] = useState<boolean>(true)
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const deleteWarning = useDisclosure()
    const editForm = useDisclosure()
    const [creating, setCreating] = useState<boolean>(false)
    const [title, setTitle] = useState<string>("")
    const [alias, setAlias] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [img, setImg] = useState<string | null>(null)
    const [imgName, setImgName] = useState<string>("")
    const [courses, setCourses] = useState<{ title: string, url: string, thumbnail: string, description: string, isPublished: boolean }[]>([])
    const [target, setTarget] = useState<number>(-1)
    const [error, setError] = useState({
        title: {
            error: false,
            msg: ""
        },
        alias: {
            error: false,
            msg: ""
        },
        description: {
            error: false,
            msg: ""
        },
        img: {
            error: false,
            msg: ""
        }
    })
    const [published, setPublished] = useState<boolean>(false)
    const fileInput = useRef<HTMLInputElement>(null)

    useEffect(() => {
        GetCourseList().then((res) => {
            if (res.error) {
                window.location.assign("/error")
            } else {
                setCourses(res.data.reverse())
                setLoading(false)
            }
        })
    }, [])

    const validate = () => {
        let valid = true
        if (title.length === 0) {
            valid = false
            setError(prevError => ({
                ...prevError,
                title: {
                    error: true,
                    msg: "Title cannot be empty"
                }
            }))
        } else if (title.includes(":") || title.includes("/") || title.includes("?") || title.includes("#") || title.includes("[") || title.includes("]") || title.includes("@") || title.includes("!") || title.includes("$") || title.includes("&") || title.includes("'") || title.includes("(") || title.includes(")") || title.includes("*") || title.includes("+") || title.includes(",") || title.includes(";") || title.includes("=") || title.includes("%") || title.includes("<") || title.includes(">") || title.includes("~") || title.includes("`") || title.includes("|")) {
            valid = false
            setError(prevError => ({
                ...prevError,
                title: {
                    error: true,
                    msg: "Title cannot contain special characters"
                }
            }))

        }
        if (alias.length === 0) {
            valid = false
            setError(prevError => ({
                ...prevError,
                alias: {
                    error: true,
                    msg: "Alias cannot be empty"
                }
            }))
        } else if (alias.includes(" ")) {
            valid = false
            setError(prevError => ({
                ...prevError,
                alias: {
                    error: true,
                    msg: "Alias cannot contain spaces"
                }
            }))
        } else if (alias.includes(":") || alias.includes("/") || alias.includes("?") || alias.includes("#") || alias.includes("[") || alias.includes("]") || alias.includes("@") || alias.includes("!") || alias.includes("$") || alias.includes("&") || alias.includes("'") || alias.includes("(") || alias.includes(")") || alias.includes("*") || alias.includes("+") || alias.includes(",") || alias.includes(";") || alias.includes("=") || alias.includes("%") || alias.includes("<") || alias.includes(">") || alias.includes("~") || alias.includes("`") || alias.includes("|")) {
            valid = false
            setError(prevError => ({
                ...prevError,
                alias: {
                    error: true,
                    msg: "Alias cannot contain special characters"
                }
            }))
        }
        if (description.length === 0) {
            valid = false
            setError(prevError => ({
                ...prevError,
                description: {
                    error: true,
                    msg: "Description cannot be empty"
                }
            }))
        }
        if (!img && !imgName) {
            valid = false
            setError(prevError => ({
                ...prevError,
                img: {
                    error: true,
                    msg: "Please upload image"
                }
            }))
        }
        return valid
    }

    const handleSubmit = async () => {
        if (validate()) {
            setCreating(true)
            try {
                const imgUrl = await client.post("/content/file-upload", {
                    fileName: imgName,
                    fileData: img
                })
                await client.post("/content/create-course", {
                    title: title,
                    url: alias,
                    description: description,
                    thumbnail: imgUrl.data.url
                })
                const response = await GetCourseList()
                if (response.error) {
                    toast.error("An unexpected error occurred.")
                } else {
                    setCourses(response.data.reverse())
                    setLoading(false)
                }
                toast.success("Course created successfully.", {
                    position: "top-center",
                    autoClose: 1500,
                    hideProgressBar: true,
                })
                setCreating(false)
                return true
            } catch (error) {
                console.error(error)
                toast.error("An unexpected error occurred.", {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                })
            }
        } else {
            return false
        }
    }

    const deleteCourse = async (url: string) => {
        try {
            await client.post("/content/delete-course", {
                url: url
            })
            const res = await GetCourseList()
            if (res.error) {
                toast.error("An unexpected error occurred.", {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                })
            } else {
                toast.success("Course deleted successfully.", {
                    position: "top-center",
                    autoClose: 1500,
                    hideProgressBar: true,
                })
                setCourses(res.data.reverse())
                setLoading(false)
            }
        } catch (error: any) {
            console.error(error)
            toast.error("An unexpected error occurred.", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
            })
        }
    }

    const editCourse = async (url: string, imageUrl: string, imgData: string) => {
        let uploadImg = ""
        if (imageUrl === imgData) {
            uploadImg = imageUrl
        } else {
            try {
                const imgUrl = await client.post("/content/file-upload", {
                    fileName: imgName,
                    fileData: img
                })
                uploadImg = imgUrl.data.url
            } catch (error) {
                console.error(error)
                toast.error("An unexpected error occurred.", {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                })
                return true
            }
        }
        if (validate()) {
            setCreating(true)
            try {
                await client.post("/content/edit-course", {
                    url: url,
                    title: title,
                    description: description,
                    thumbnail: uploadImg,
                    update_url: alias,
                    isPublished: published
                })
                const response = await GetCourseList()
                if (response.error) {
                    toast.error("An unexpected error occurred.")
                } else {
                    setCourses(response.data.reverse())
                    setLoading(false)
                }
                toast.success("Course edited successfully.", {
                    position: "top-center",
                    autoClose: 1500,
                    hideProgressBar: true,
                })
                setCreating(false)
            } catch (error) {
                console.error(error)
                toast.error("An unexpected error occurred.", {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                })
            }
            return true
        } else {
            return false
        }
    }

    if (loading) {
        return <Loading />
    } else {
        return (
            <>
                <div className="w-full h-full flex flex-col pt-5 items-center md:items-start pl-5 pr-5 md:pr-0">
                    <h1 className="text-4xl">Manage Courses</h1>
                    <div className="flex flex-row flex-wrap gap-5 mt-5 pb-5 w-full">
                        <Card className="w-full lg:w-[32%] h-[400px] bg-gray-300" isPressable onClick={onOpen}>
                            <CardBody className="w-full h-full items-center justify-center">
                                <h1 className="text-lg text-gray-500">Create Course</h1>
                                <PlusCircleFill className="text-lg mt-2 text-gray-500" />
                            </CardBody>
                        </Card>
                        {
                            courses.map((course, index) => (
                                <Card key={index} className="w-full lg:w-[32%] h-[400px] pb-5">
                                    <CardHeader className="w-full flex flex-row justify-center h-1/2">
                                        <img alt="thumbnail" src={course.thumbnail} className="rounded-xl object-cover w-full h-full" />
                                    </CardHeader>
                                    <CardBody className="w-full h-full px-5">
                                        <div className="flex flex-row gap-x-2 items-center">
                                            <h1 className="text-xl">{course.title}</h1>
                                            <Pencil className="hover:text-primary cursor-pointer" onClick={() => {
                                                setTarget(index)
                                                setTitle(course.title)
                                                setAlias(course.url)
                                                setDescription(course.description)
                                                setImg(course.thumbnail)
                                                setPublished(course.isPublished)
                                                editForm.onOpen()
                                            }} />
                                            <Trash className="hover:text-danger cursor-pointer" onClick={() => {
                                                setTarget(index)
                                                deleteWarning.onOpen()
                                            }} />
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2 overflow-hidden overflow-ellipsis">{course.description}</p>
                                        <Button className="mt-auto" color='primary' onClick={() => {
                                            window.location.assign(`/courses/${course.url}`)
                                        }}>Go to Course</Button>
                                    </CardBody>
                                </Card>
                            ))
                        }
                    </div>
                </div>
                <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={!creating} hideCloseButton={creating} onClose={() => {
                    setImg(null)
                    setTitle("")
                    setDescription("")
                    setAlias("")
                    setError({
                        title: {
                            error: false,
                            msg: ""
                        },
                        alias: {
                            error: false,
                            msg: ""
                        },
                        description: {
                            error: false,
                            msg: ""
                        },
                        img: {
                            error: false,
                            msg: ""
                        }
                    })
                }}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Create Course</ModalHeader>
                                <ModalBody className="pb-5">
                                    <Input value={title} isInvalid={error.title.error} errorMessage={error.title.msg} label="Course Title" onChange={(e) => {
                                        setTitle(e.target.value)
                                        setAlias(e.target.value.toLowerCase().trim().replace(/ /g, "-"))
                                        setError(prevError => ({
                                            ...prevError,
                                            title: {
                                                error: false,
                                                msg: ""
                                            }
                                        }))
                                    }} labelPlacement="outside" placeholder="Enter Title" variant="bordered" size="lg" />
                                    <Input value={alias} isInvalid={error.alias.error} errorMessage={error.alias.msg} label="Course Alias" onChange={(e) => {
                                        setAlias(e.target.value)
                                        setError(prevError => ({
                                            ...prevError,
                                            alias: {
                                                error: false,
                                                msg: ""
                                            }
                                        }))
                                    }} labelPlacement="outside" placeholder="Enter Alias" variant="bordered" size="lg" />
                                    <Textarea value={description} isInvalid={error.description.error} errorMessage={error.description.msg} label="Course Description" onChange={(e) => {
                                        setDescription(e.target.value)
                                        setError(prevError => ({
                                            ...prevError,
                                            description: {
                                                error: false,
                                                msg: ""
                                            }
                                        }))
                                    }} labelPlacement="outside" placeholder="Enter Description" variant="bordered" size="lg" maxRows={3} />
                                    <label className="text-md">Course Image</label>
                                    <Button className="w-full" color={error.img.error ? "danger" : img && imgName ? "primary" : "default"} onClick={() => {
                                        if (fileInput.current) {
                                            fileInput.current.click()
                                        }
                                    }}><Upload size={20} /> {error.img.error ? error.img.msg : img && imgName ? imgName : "Upload Image"}</Button>
                                    <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={() => {
                                        if (fileInput.current) {
                                            const file = fileInput.current.files?.item(0)
                                            if (file) {
                                                const reader = new FileReader()
                                                reader.onload = () => {
                                                    setImg(reader.result as string)
                                                    setImgName(file.name)
                                                    setError(prevError => ({
                                                        ...prevError,
                                                        img: {
                                                            error: false,
                                                            msg: ""
                                                        }
                                                    }))
                                                }
                                                reader.readAsDataURL(file)
                                            }
                                        }

                                    }} />
                                </ModalBody>
                                <Divider />
                                <ModalFooter>
                                    <Button color="primary" className="w-full" isLoading={creating} onClick={() => {
                                        handleSubmit().then((res) => {
                                            if (res === true) {
                                                onClose()
                                            }
                                        })
                                    }}>{creating ? "" : "Create Course"}</Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                <Modal isOpen={deleteWarning.isOpen} onOpenChange={deleteWarning.onOpenChange} isDismissable={!creating} hideCloseButton={creating} onClose={() => {
                    setCreating(false)
                    setTarget(-1)
                }}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Delete Course</ModalHeader>
                                <ModalBody className="pb-5">
                                    <p className="text-lg">Are you sure you want to delete this course?</p>
                                </ModalBody>
                                <Divider />
                                <ModalFooter>
                                    <Button color="danger" className="w-full" onClick={() => {
                                        setCreating(true)
                                        deleteCourse(courses[target].url).then(() => {
                                            onClose()
                                        })
                                    }}>Delete Course</Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                <Modal isOpen={editForm.isOpen} onOpenChange={editForm.onOpenChange} isDismissable={!creating} hideCloseButton={creating} onClose={() => {
                    setImg(null)
                    setImgName("")
                    setTitle("")
                    setDescription("")
                    setError({
                        title: {
                            error: false,
                            msg: ""
                        },
                        alias: {
                            error: false,
                            msg: ""
                        },
                        description: {
                            error: false,
                            msg: ""
                        },
                        img: {
                            error: false,
                            msg: ""
                        }
                    })
                    setTarget(-1)
                    setPublished(false)
                }}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Edit Course</ModalHeader>
                                <ModalBody className="pb-5">
                                    <Input value={title} isInvalid={error.title.error} errorMessage={error.title.msg} label="Course Title" onChange={(e) => {
                                        setTitle(e.target.value)
                                        setAlias(e.target.value.toLowerCase().trim().replace(/ /g, "-"))
                                        setError(prevError => ({
                                            ...prevError,
                                            title: {
                                                error: false,
                                                msg: ""
                                            }
                                        }))
                                    }} labelPlacement="outside" placeholder="Enter Title" variant="bordered" size="lg" />
                                    <Input value={alias} isInvalid={error.alias.error} errorMessage={error.alias.msg} label="Course Alias" onChange={(e) => {
                                        setAlias(e.target.value)
                                        setError(prevError => ({
                                            ...prevError,
                                            alias: {
                                                error: false,
                                                msg: ""
                                            }
                                        }))
                                    }} labelPlacement="outside" placeholder="Enter Alias" variant="bordered" size="lg" />
                                    <Textarea value={description} isInvalid={error.description.error} errorMessage={error.description.msg} label="Course Description" onChange={(e) => {
                                        setDescription(e.target.value)
                                        setError(prevError => ({
                                            ...prevError,
                                            description: {
                                                error: false,
                                                msg: ""
                                            }
                                        }))
                                    }} labelPlacement="outside" placeholder="Enter Description" variant="bordered" size="lg" maxRows={3} />
                                    <Button className="w-full" color={error.img.error ? "danger" : img ? "primary" : "default"} onClick={() => {
                                        if (fileInput.current) {
                                            fileInput.current.click()
                                        }
                                    }}><Upload size={20} /> {error.img.error ? error.img.msg : img ? "Update Image" : "Upload Image"}</Button>
                                    <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={() => {
                                        if (fileInput.current) {
                                            const file = fileInput.current.files?.item(0)
                                            if (file) {
                                                const reader = new FileReader()
                                                reader.onload = () => {
                                                    setImg(reader.result as string)
                                                    setImgName(file.name)
                                                    setError(prevError => ({
                                                        ...prevError,
                                                        img: {
                                                            error: false,
                                                            msg: ""
                                                        }
                                                    }))
                                                }
                                                reader.readAsDataURL(file)
                                            }
                                        }

                                    }} />
                                    <Switch isSelected={published} onChange={() => {
                                        setPublished(prevState => !prevState)
                                    }}>
                                        {published ? "Published" : "Not Published"}
                                    </Switch>
                                </ModalBody>
                                <Divider />
                                <ModalFooter>
                                    <Button color="primary" className="w-full" isLoading={creating} onClick={() => {
                                        editCourse(courses[target].url, courses[target].thumbnail, img!).then((res) => {
                                            if (res === true) {
                                                onClose()
                                            }
                                        })
                                    }}>{creating ? "" : "Edit Course"}</Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </>
        )
    }
}