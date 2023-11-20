import { Button, Card, CardHeader, CardBody, Modal, ModalBody, ModalHeader, ModalContent, useDisclosure, ModalFooter } from "@nextui-org/react"
import Container from "../Container"
import Nav from "../Nav"
import { PlusCircleFill } from "react-bootstrap-icons"
import { useState, useEffect } from "react"
import Loading from "../Loading"

export default function StudentDashboard() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [code, setCode] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(true)
    const [joining, setJoining] = useState<boolean>(false)
    const [active, setActive] = useState<number>(0)
    const [error, setError] = useState({
        error: false,
        msg: ""
    })
    useEffect(() => {
        setLoading(false)
        const timeout = setTimeout(() => {
            console.log("This is taking a while.")
        }, 10000)
        clearTimeout(timeout)
    }, [])
    const classes = [
        {
            teacher: "KYLE MOTLEY",
            name: "Advanced Cybersecurity"
        },
        {
            teacher: "SARAH JONES",
            name: "Basic Computer Safety"
        },
        {
            teacher: "DARSH PODDAR",
            name: "Intro to Cybersecurity"
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
            <Container>
                <Nav login={true}></Nav>
                <div className="w-full grow">
                    <div aria-label="side-menu" className="hidden h-full md:flex md:w-1/5 md:justify-center border border-r-gray-200">
                        <div className="w-[95%] mt-5">
                            Your Classes
                            {
                                classes.map((item, index) => (
                                    <Button>
                                        {item.name}
                                    </Button>
                                ))
                            }
                            <Button onClick={onOpen}>Add new class</Button>
                        </div>
                    </div>
                </div>
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader> </ModalHeader>
                                <ModalBody>
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
                                    <Button className="w-full mt-3" isLoading={joining} isDisabled={code.length !== 6 || joining} color="primary" onClick={() => {
                                        {
                                            // handleJoin()
                                        }
                                        setJoining(true)
                                    }}>{!joining && "Join Class"}</Button>
                                </ModalBody>
                                <ModalFooter></ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </Container>
        )
    }
}