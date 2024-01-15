import { Button, Card, CardHeader, CardBody, Modal, ModalBody, ModalContent, useDisclosure, Divider, ModalHeader, Input, ModalFooter } from "@nextui-org/react"
import { PlusCircleFill } from "react-bootstrap-icons"
import { useState, useEffect } from "react"
import Loading from "../Loading"
import AccessChecker from "../functions/AccessChecker"
import GetClass from "../functions/GetClass"

export default function TeacherDashboard() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [code, setCode] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [joining, setJoining] = useState<boolean>(false)
    const [active, setActive] = useState<number>(0)
    const [error, setError] = useState({
        error: false,
        msg: ""
    })
    const [role, setRole] = useState<string[]>([])
    const [name, setName] = useState<string>("")

    useEffect(() => {
        AccessChecker(1).then((res) => {
            if (res.code === 200) {
                if (res.data.level > 1 && res.data.level < 3) {
                    window.location.assign(`/dashboard`)
                } else {
                    GetClass().then((res) => {
                        console.log(res.data)
                    })
                    setRole(res.data.role)
                    setName(`${res.data.firstName} ${res.data.lastName}`)
                    setLoading(false)
                }
            } else if (res.code === 401) {
                window.location.assign("/login")
            } else if (res.code === 500) {
                window.location.assign("/error")
            }
        })
    }, [])
    const classes = [
        {
            teacher: "KYLE MOTLEY",
            name: "Advanced Cybersecurity",
            code: "ABC123"
        },
        {
            teacher: "SARAH JONES",
            name: "Basic Computer Safety",
            code: "DEF456"
        },
        {
            teacher: "DARSH PODDAR",
            name: "Intro to Cybersecurity",
            code: "GHI789"
        }
    ]
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
                                classes.map((item, index) => (
                                    <p className="font-bold select-none cursor-pointer" key={item.code} onClick={() => {
                                        setActive(index)
                                    }} style={{ color: active === index ? "#006FEE" : "inherit" }}>
                                        {item.name}
                                    </p>
                                ))
                            }
                            <Divider />
                            <Button onClick={onOpen} className="w-full flex-shrink-0" color="primary">
                                <PlusCircleFill />
                                Create new class
                            </Button>
                        </div>
                    </div>
                    <div className="w-full lg:w-4/5 flex flex-col gap-y-5 p-10 overflow-y-auto">

                    </div>
                </div>
                <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={() => {
                    setCode("")
                    setJoining(false)
                }} isDismissable={!joining} hideCloseButton={joining}>
                    <ModalContent>
                        {(_onClose) => (
                            <>
                                <ModalHeader>Create New Class</ModalHeader>
                                <ModalBody className="pb-5">
                                    <Input isInvalid={error.error} errorMessage={error.error ? error.msg : ""} label="Class Name" labelPlacement="outside" placeholder="Enter Class Name" variant="bordered" onChange={(e) => {
                                        setCode(e.target.value)
                                    }} />
                                    <Button className="w-full mt-1" isLoading={joining} isDisabled={code.length < 1 || code.length > 100} color="primary" onClick={() => {
                                        {
                                            // handleJoin()
                                        }
                                        setJoining(true)
                                    }}>{!joining && "Create Class"}</Button>
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </>
        )
    }
}