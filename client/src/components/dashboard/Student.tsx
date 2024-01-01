import { Button, Card, CardHeader, CardBody, Modal, ModalBody, ModalContent, useDisclosure, Divider } from "@nextui-org/react"
import Container from "../Container"
import Nav from "../Nav"
import { PlusCircleFill } from "react-bootstrap-icons"
import { useState, useEffect } from "react"
import Loading from "../Loading"
import getUser from "../functions/GetUser"

export default function StudentDashboard() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [code, setCode] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [joining, setJoining] = useState<boolean>(false)
    const [active, setActive] = useState<number>(0)
    const [error, setError] = useState({
        error: false,
        msg: ""
    })
    const handleRefresh = (code: number) => {

    }
    useEffect(() => {
        setLoading(false)
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
        return (
            <Container>
                <Loading></Loading>
            </Container>
        )
    } else {
        return (
            <>
                <div className="w-full grow">
                    <div aria-label="side-menu" className="hidden h-full md:flex md:w-1/5 md:justify-center border border-r-gray-200">
                        <div className="w-5/6 mt-5 gap-y-5 flex flex-col items-start">
                            <h1 className="text-xl">Your Classes</h1>
                            {
                                classes.map((item, index) => (
                                    <h1 className="font-bold select-none cursor-pointer" key={item.code} onClick={() => {
                                        setActive(index)
                                    }} style={{ color: active === index ? "#006FEE" : "inherit" }}>
                                        {item.name}
                                    </h1>
                                ))
                            }
                            <Divider />
                            <Button onClick={onOpen} className="w-full" color="primary">
                                <PlusCircleFill />
                                Add new class
                            </Button>
                        </div>
                    </div>
                </div>
                <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={() => {
                    setCode("")
                    setJoining(false)
                }} isDismissable={!joining} hideCloseButton={joining}>
                    <ModalContent>
                        {(_onClose) => (
                            <>
                                <ModalBody className="pt-7 pb-7">
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="text-2xl">Enter Class Code</span>
                                        <input value={code} onChange={(e) => {
                                            setError({
                                                error: false,
                                                msg: ""
                                            })
                                            if (!(e.target.value.length > 6)) {
                                                setCode(e.target.value.toUpperCase())
                                            }
                                        }} className={`w-full border-2 ${error.error ? "border-[#f31260]" : "border-gray-300"} rounded-lg p-3 mt-3 text-center focus:outline-none`} />
                                        <span className={!error.error ? "hidden" : "text-sm self-start text-[#f31260]"}>{error.msg}</span>
                                    </div>
                                    <Button className="w-full mt-1" isLoading={joining} isDisabled={code.length !== 6 || joining} color="primary" onClick={() => {
                                        {
                                            // handleJoin()
                                        }
                                        setJoining(true)
                                    }}>{!joining && "Join Class"}</Button>
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </>
        )
    }
}