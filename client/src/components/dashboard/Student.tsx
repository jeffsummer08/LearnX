// @ts-ignore
import { Button, Card, CardHeader, CardBody, Modal, ModalBody, ModalContent, useDisclosure, Divider } from "@nextui-org/react"
import { PlusCircleFill } from "react-bootstrap-icons"
import { useState, useEffect } from "react"
import Loading from "../Loading"
import AccessChecker from "../functions/AccessChecker"
import GetClassList from "../functions/GetClassList"
import client from "../instance"
import { toast } from "react-toastify"

export default function StudentDashboard() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [code, setCode] = useState<string>("")
    const [classes, setClasses] = useState<any>([])
    const [loading, setLoading] = useState(true)
    const [joining, setJoining] = useState<boolean>(false)
    const [active, setActive] = useState<number>(0)
    const [error, setError] = useState({
        error: false,
        msg: ""
    })

    useEffect(() => {
        AccessChecker(0).then((res) => {
            if (res.code === 200) {
                if (res.data.level > 0 && res.data.level < 3) {
                    window.location.assign(`/dashboard`)
                } else {
                    GetClassList().then((res) => {
                        console.log(res.data)
                        setClasses(res.data)
                        setLoading(false)
                    })
                }
            } else if (res.code === 401) {
                window.location.assign("/login")
            } else if (res.code === 500) {
                window.location.assign("/error")
            }
        })
    }, [])

    const handleJoin = async () => {
        setJoining(true)
        try {
            const res = await client.post("/classes/join-class", {
                join_code: code.toLowerCase()
            })
            const newClasses = await GetClassList()
            setClasses(newClasses.data)
            toast.success(res.data.msg)
            return true
        } catch (error: any) {
            setError({
                error: true,
                msg: error.response.data.msg
            })
            setJoining(false)
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
                                classes.memberOf.map((item: any, index: number) => (
                                    <p className="font-bold select-none cursor-pointer" key={index} onClick={() => {
                                        setActive(index)
                                    }} style={{ color: active === index ? "#006FEE" : "inherit" }}>
                                        {item.name}
                                    </p>
                                ))
                            }
                            {
                                classes.memberOf.length === 0 && (
                                    <h3>
                                        Join a class
                                    </h3>
                                )
                            }
                            <Divider />
                            <Button onClick={onOpen} className="w-full flex-shrink-0" color="primary">
                                <PlusCircleFill />
                                Join new class
                            </Button>
                        </div>
                    </div>
                    <div className="w-full lg:w-4/5 flex flex-col gap-y-5 p-10 overflow-y-auto">
                        <div className="flex flex-row justify-between items-center">
                            <h3>{classes.memberOf[active].name}</h3>
                            <div className="flex flex-row items-center gap-x-5">
                                <div className="flex flex-col items-center">
                                    <p>Class Code:</p>
                                    <p>{classes.memberOf[active].joinCode.toUpperCase()}</p>
                                </div>
                            </div>
                        </div>
                        <Divider />
                    </div>
                </div>
                <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={() => {
                    setCode("")
                    setJoining(false)
                }} isDismissable={!joining} hideCloseButton={joining}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalBody className="pt-7 pb-7">
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="text-2xl">Enter Class Code</span>
                                        <input value={code} onChange={(e) => {
                                            if (!(e.target.value.length > 8)) {
                                                setCode(e.target.value.toUpperCase())
                                            }
                                        }}
                                            className={`w-full border-2 rounded-lg p-3 mt-3 text-center focus:outline-none`}
                                            style={{ border: error.error ? "2px solid #f31260" : "2px solid #006FEE" }}
                                        />
                                        <span className={!error.error ? "hidden" : "text-sm self-start text-[#f31260]"}>{error.msg}</span>
                                    </div>
                                    <Button className="w-full mt-1" isLoading={joining} isDisabled={code.length !== 8 || joining} color="primary" onClick={() => {
                                        setError({
                                            error: false,
                                            msg: ""
                                        })
                                        handleJoin().then((res) => {
                                            if (res) {
                                                onClose()
                                            }
                                        })
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