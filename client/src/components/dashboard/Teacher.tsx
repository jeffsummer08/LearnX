// @ts-ignore
import { Button, Card, CardHeader, CardBody, Modal, ModalBody, ModalContent, useDisclosure, Divider, ModalHeader, Input, ModalFooter, Spinner, CardFooter, Tooltip } from "@nextui-org/react"
import { Pencil, PersonSlash, PlusCircleFill, Trash } from "react-bootstrap-icons"
import { useState, useEffect } from "react"
import Loading from "../Loading"
import AccessChecker from "../functions/AccessChecker"
import GetClassList from "../functions/GetClassList"
import client from "../instance"
import { toast } from "react-toastify"
import GetClass from "../functions/GetClass"

export default function TeacherDashboard() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const disclosure = useDisclosure()
    const editClass = useDisclosure()
    const banUserModal = useDisclosure()
    const [name, setName] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [classes, setClasses] = useState<any>(null)
    const [activeClass, setActiveClass] = useState<any>(null)
    const [creating, setCreating] = useState<boolean>(false)
    const [active, setActive] = useState<number>(-1)
    const [code, setCode] = useState<string>("")
    const [error, setError] = useState({
        error: false,
        msg: ""
    })
    const [studentName, setStudentName] = useState<string>("")
    const [studentId, setStudentId] = useState<number>(-1)
    const [studentView, setStudentView] = useState(false)
    const [gettingStudent, setGettingStudent] = useState(false)
    const [studentData, setStudentData] = useState<any>(null)
    useEffect(() => {
        AccessChecker(1).then((res) => {
            if (res.code === 200) {
                if (res.data.level > 1 && res.data.level < 3) {
                    window.location.assign(`/dashboard`)
                } else {
                    GetClassList().then((res) => {
                        console.log(res.data)
                        setClasses(res.data)
                        if (res.data.ownerOf.length > 0) {
                            setActive(0)
                        } else {
                            setLoading(false)
                        }
                    })
                }
            } else if (res.code === 401) {
                window.location.assign("/login")
            } else if (res.code === 500) {
                window.location.assign("/error")
            }
        })
    }, [])

    useEffect(() => {
        if (active >= 0) {
            console.log("hello")
            GetClass(classes.ownerOf[active].joinCode).then((res) => {
                if (res.error) {
                    toast.error("Invalid class code")
                } else {
                    setActiveClass(res.data)
                }
                setLoading(false)
            })
        }
    }, [active])

    const handleCreate = async () => {
        setCreating(true)
        try {
            const res = await client.post("/classes/create-class", {
                name: name
            })
            const newClass = await GetClassList()
            setClasses(newClass.data)
            setActive(0)
            toast.success(res.data.msg)
            return true
        } catch (error: any) {
            console.error(error)
            setError({
                error: true,
                msg: error.response.data.msg
            })
            return false
        }
    }

    const handleEdit = async () => {
        setCreating(true)
        try {
            const res = await client.post("/classes/edit-class", {
                name: name,
                join_code: code
            })
            const newClass = await GetClassList()
            setClasses(newClass.data)
            toast.success(res.data.msg)
            return true
        } catch (error: any) {
            setError({
                error: true,
                msg: error.data.response.msg
            })
            return false
        }
    }

    const handleDelete = async () => {
        setCreating(true)
        try {
            const res = await client.post("/classes/delete-class", {
                join_code: classes.ownerOf[active].joinCode
            })
            const newClass = await GetClassList()
            setClasses(newClass.data)
            toast.success(res.data.msg)
            return true
        } catch (error: any) {
            setCreating(false)
            toast.error(error.response.data.msg)
            return false
        }
    }

    const banUser = async () => {
        setCreating(true)
        try {
            const res = await client.post("/classes/ban-student", {
                join_code: classes.ownerOf[active].joinCode,
                student_id: studentId
            })
            const newClass = await GetClassList()
            setClasses(newClass.data)
            toast.success(res.data.msg)
        } catch (error: any) {
            toast.error(error.response.data.msg)
        }
    }

    if (loading) {
        return <Loading />
    } else {
        return (
            <>
                <div className="flex flex-col-reverse md:flex-row w-full h-full overflow-hidden">
                    <div aria-label="side-menu" className="h-[250px] md:h-full flex justify-center md:w-1/5 border border-r-gray-200 overflow-y-auto">
                        <div className="w-5/6 mt-5 gap-y-5 flex flex-col items-start">
                            <h1 className="text-xl font-bold">Your Classes</h1>
                            <Divider />
                            {
                                classes.ownerOf.map((item: any, index: any) => (
                                    <p className="font-bold select-none cursor-pointer" key={index} onClick={() => {
                                        setActive(index)
                                        setActiveClass(null)
                                    }} style={{ color: active === index ? "#006FEE" : "inherit" }}>
                                        {item.name}
                                    </p>
                                ))
                            }
                            {
                                classes.ownerOf.length === 0 && <h2>Create a class</h2>
                            }
                            <Divider />
                            <Button onClick={onOpen} className="w-full flex-shrink-0 text-white bg-[#DB27F2]">
                                <PlusCircleFill />
                                Create new class
                            </Button>
                        </div>
                    </div>
                    <div className="w-full h-full lg:w-4/5 flex flex-col gap-y-5 p-10 overflow-y-auto">
                        {
                            active >= 0 ? (
                                <>
                                    <div className="flex flex-row justify-between items-center">
                                        <h3>{classes.ownerOf[active].name}</h3>
                                        <div className="flex flex-row items-center gap-x-5">
                                            <div className="flex flex-col items-center">
                                                <p>Class Code:</p>
                                                <p>{classes.ownerOf[active].joinCode.toUpperCase()}</p>
                                            </div>
                                            <Tooltip content="Edit Class" placement="bottom" color="primary" closeDelay={0} size="sm">
                                                <Pencil className="hover:text-primary cursor-pointer" onClick={() => {
                                                    setName(classes.ownerOf[active].name)
                                                    setCode(classes.ownerOf[active].joinCode)
                                                    editClass.onOpenChange()
                                                }} />
                                            </Tooltip>
                                            <Tooltip content="Delete Class" placement="bottom" color="danger" closeDelay={0} size="sm">
                                                <Trash className="hover:text-danger cursor-pointer" onClick={() => {
                                                    setCode(classes.ownerOf[active].joinCode)
                                                    disclosure.onOpenChange()
                                                }} />
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <Divider />
                                    <div className="w-full h-full">
                                        {
                                            activeClass ? (
                                                <>
                                                    {
                                                        activeClass.students.length > 0 ? (
                                                            <>
                                                                {
                                                                    studentView ? (
                                                                        <>
                                                                            {
                                                                                gettingStudent ? (
                                                                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                                                                        <Spinner />
                                                                                    </div>
                                                                                ) : (
                                                                                    <></>
                                                                                )
                                                                            }
                                                                        </>
                                                                    ) : (
                                                                        <div className="flex flex-col md:flex-row md:flex-wrap gap-y-3">
                                                                            {
                                                                                activeClass.students.map((item: any, index: number) => (
                                                                                    <div key={index} className="flex flex-row justify-center w-full md:w-1/4">
                                                                                        <Card className="p-2 w-[95%] h-full">
                                                                                            <CardHeader className="text-xl w-full flex flex-row justify-between items-center">
                                                                                                <p>{item.name}</p>
                                                                                                <Tooltip content="Ban User" color="danger" closeDelay={0} size="sm">
                                                                                                    <PersonSlash className="hover:text-danger cursor-pointer" onClick={() => {
                                                                                                        setStudentId(item.id)
                                                                                                        setStudentName(item.name)
                                                                                                        banUserModal.onOpenChange()
                                                                                                    }} />
                                                                                                </Tooltip>
                                                                                            </CardHeader>
                                                                                            <CardFooter>
                                                                                                <Button className="w-full bg-[#2731F2] text-white" onClick={() => {
                                                                                                    setStudentView(true)
                                                                                                    setGettingStudent(true)
                                                                                                    console.log(classes.ownerOf[active].joinCode)
                                                                                                    console.log(item.id)
                                                                                                    client.get(`classes/${classes.ownerOf[active].joinCode}/view/${item.id}`).then((res) => {
                                                                                                        setStudentData(res.data)
                                                                                                        setGettingStudent(false)
                                                                                                    })
                                                                                                }}>View Progress</Button>
                                                                                            </CardFooter>
                                                                                        </Card>
                                                                                    </div>
                                                                                ))
                                                                            }
                                                                        </div>
                                                                    )

                                                                }
                                                            </>
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center">
                                                                <h3>No students have joined this class yet.</h3>
                                                            </div>
                                                        )
                                                    }
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center">
                                                    <Spinner />
                                                </div>
                                            )
                                        }
                                    </div>
                                </>
                            ) : (
                                <></>
                            )
                        }
                    </div>
                </div >
                <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={() => {
                    setName("")
                    setCreating(false)
                }} isDismissable={!creating} hideCloseButton={creating}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Create New Class</ModalHeader>
                                <ModalBody className="pb-5">
                                    <Input value={name} isInvalid={error.error} errorMessage={error.error ? error.msg : ""} label="Class Name" labelPlacement="outside" placeholder="Enter Class Name" variant="bordered" onChange={(e) => {
                                        setName(e.target.value)
                                    }} />
                                    <Button className="w-full mt-1" isLoading={creating} isDisabled={name.length < 1 || name.length > 100} color="primary" onClick={() => {
                                        setError({
                                            error: false,
                                            msg: ""
                                        })
                                        handleCreate().then((res) => {
                                            if (res === true) {
                                                onClose()
                                            }
                                        })
                                    }}>{!creating && "Create Class"}</Button>
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                <Modal isOpen={editClass.isOpen} onOpenChange={editClass.onOpenChange} onClose={() => {
                    setName("")
                    setCode
                    setCreating(false)
                }} isDismissable={!creating} hideCloseButton={creating}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Edit Class</ModalHeader>
                                <ModalBody className="pb-5">
                                    <Input value={name} isInvalid={error.error} errorMessage={error.error ? error.msg : ""} label="Class Name" labelPlacement="outside" placeholder="Enter Class Name" variant="bordered" onChange={(e) => {
                                        setName(e.target.value)
                                    }} />
                                    <Button className="w-full mt-1" isLoading={creating} isDisabled={name.length < 1 || name.length > 100} color="primary" onClick={() => {
                                        setError({
                                            error: false,
                                            msg: ""
                                        })
                                        handleEdit().then((res) => {
                                            if (res === true) {
                                                onClose()
                                            }
                                        })
                                    }}>{!creating && "Edit Class"}</Button>
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                <Modal isOpen={disclosure.isOpen} isDismissable={!creating} hideCloseButton={creating} onOpenChange={disclosure.onOpenChange} onClose={() => {
                    if (!(active === 0)) {
                        setActive(prevActive => prevActive - 1)
                    }
                    setCreating(false)
                }}>
                    <ModalContent className="text-center">
                        {(onClose) => (
                            <>
                                <ModalBody className="py-5">
                                    <h1 className="text-lg font-bold">Delete Unit</h1>
                                    <p>Are you sure you want to delete this unit?</p>
                                    <Button color="danger" onClick={() => {
                                        handleDelete().then((res) => {
                                            if (res === true) {
                                                onClose()
                                            }
                                        })
                                    }} isLoading={creating}>
                                        {creating ? "" : "Delete Unit"}
                                    </Button>
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                <Modal isOpen={banUserModal.isOpen} isDismissable={!creating} hideCloseButton={creating} onOpenChange={banUserModal.onOpenChange} onClose={() => {
                    setStudentId(-1)
                    setStudentName("")
                    setCreating(false)
                }}>
                    <ModalContent className="text-center">
                        {(onClose) => (
                            <>
                                <ModalBody className="py-5">
                                    <h1 className="text-lg font-bold">Ban User</h1>
                                    <p>Are you sure you want to ban {studentName}? This action is irreversible.</p>
                                    <Button color="danger" onClick={() => {
                                        banUser().then(() => {
                                            onClose()
                                        })
                                    }} isLoading={creating}>
                                        {creating ? "" : "Ban User"}
                                    </Button>
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </>
        )
    }
}