import { Button, Card, CardHeader, CardBody, Modal, ModalBody, ModalContent, useDisclosure, Divider, ModalHeader, Input, ModalFooter } from "@nextui-org/react"
import { Pencil, PlusCircleFill, Trash } from "react-bootstrap-icons"
import { useState, useEffect } from "react"
import Loading from "../Loading"
import AccessChecker from "../functions/AccessChecker"
import GetClassList from "../functions/GetClassList"
import client from "../instance"
import { toast } from "react-toastify"
import GetClass from "../functions/GetClass"

export default function TeacherDashboard() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const editClass = useDisclosure()
    const [name, setName] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [classes, setClasses] = useState<any>(null)
    const [creating, setCreating] = useState<boolean>(false)
    const [active, setActive] = useState<number>(-1)
    const [code, setCode] = useState<string>("")
    const [error, setError] = useState({
        error: false,
        msg: ""
    })
    useEffect(() => {
        AccessChecker(1).then((res) => {
            if (res.code === 200) {
                if (res.data.level > 1 && res.data.level < 3) {
                    window.location.assign(`/dashboard`)
                } else {
                    GetClassList().then((res) => {
                        console.log(res.data)
                        setClasses(res.data)
                        setActive(0)
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
                    console.log(res.data)
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
                                    }} style={{ color: active === index ? "#006FEE" : "inherit" }}>
                                        {item.name}
                                    </p>
                                ))
                            }
                            {
                                classes.ownerOf.length === 0 && <h2>Create a class</h2>
                            }
                            <Divider />
                            <Button onClick={onOpen} className="w-full flex-shrink-0" color="primary">
                                <PlusCircleFill />
                                Create new class
                            </Button>
                        </div>
                    </div>
                    <div className="w-full lg:w-4/5 flex flex-col gap-y-5 p-10 overflow-y-auto">
                        {
                            active >= 0 ? (
                                <>
                                    <div className="flex flex-row justify-between items-center">
                                        <h3>{classes.ownerOf[active].name}</h3>
                                        <div className="flex flex-row items-center gap-x-3">
                                            <div className="flex flex-col items-center">
                                                <p>Class Code:</p>
                                                <p>{classes.ownerOf[active].joinCode.toUpperCase()}</p>
                                            </div>
                                            <Pencil onClick={() => {
                                                setName(classes.ownerOf[active].name)
                                                setCode(classes.ownerOf[active].joinCode)
                                                editClass.onOpenChange()
                                            }} />
                                            <Trash />
                                        </div>
                                    </div>
                                    <Divider />
                                </>
                            ) : (
                                <></>
                            )
                        }
                    </div>
                </div>
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
            </>
        )
    }
}