import AccessChecker from "../../components/functions/AccessChecker"
import Loading from "../../components/Loading"
import { useEffect, useState } from "react"
import Container from "../../components/Container"
import Nav from "../../components/Nav"
import { Divider, Button, Modal, ModalBody, ModalHeader, ModalFooter, useDisclosure, ModalContent, Input } from "@nextui-org/react"
import client from "../../components/instance"
import { Eye, EyeSlash } from "react-bootstrap-icons"
import { toast } from "react-toastify"

export default function Settings() {
    const [loading, setLoading] = useState<boolean>(true)
    const [role, setRole] = useState<string[] | null>(null)
    const [name, setName] = useState("")
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [visible, setVisible] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false
    })
    const [doing, setDoing] = useState<boolean>(false)
    const [error, setError] = useState({
        error: false,
        msg: ""
    })
    const ResetPassword = useDisclosure()
    const DeleteAccount = useDisclosure()
    useEffect(() => {
        AccessChecker(0).then((res) => {
            if (res.code === 200) {
                if (res.data.role.length > 0) {
                    setRole(res.data.role)
                }
                setName(`${res.data.firstName} ${res.data.lastName}`)
                setLoading(false)
            } else if (res.code === 401) {
                window.location.assign("/login")
            } else if (res.code === 500) {
                window.location.assign("/error")
            }
        })
    }, [])

    const handleResetPassword = async () => {
        setDoing(true)
        try {
            const res = await client.post("/auth/reset-password", {
                password: oldPassword,
                new_password: newPassword
            })
            toast.success(res.data.msg)
            return true
        } catch (error: any) {
            setDoing(false)
            console.error(error)
            setError({
                error: true,
                msg: error.response.data.msg
            })
            return false
        }
    }

    const handleDeleteAccount = async () => {
        setDoing(true)
        try {
            const res = await client.post("/auth/deactivate-account", {
                password: oldPassword
            })
            toast.success(res.data.msg)
            return true
        } catch (error: any) {
            console.error(error)
            setDoing(false)
            setError({
                error: true,
                msg: error.response.data.msg
            })
            return false
        }
    }

    if (loading) {
        return <Loading />
    } else {
        return (
            <Container>
                <Nav role={role} name={name}></Nav>
                <div className="flex w-full h-full flex-col p-10 gap-y-5">
                    <p className="text-3xl">Settings</p>
                    <Divider />
                    <p className="text-xl">Name: {name}</p>
                    <p className="text-xl">Account Type: {role!.includes("superuser") ? "Superuser" : role!.includes("staff") ? "Staff" : role!.includes("teacher") ? "Teacher" : "Student"}</p>
                    <Button className="w-full md:w-1/4" variant="bordered" onClick={() => {
                        ResetPassword.onOpen()
                    }}>Reset Password</Button>
                    <Divider />
                    <p className="text-danger font-bold text-xl">The Danger Zone</p>
                    <Button className="w-full md:w-1/4" color="danger" onClick={() => {
                        DeleteAccount.onOpen()
                    }}>
                        Delete Account
                    </Button>
                </div>
                <Modal isOpen={ResetPassword.isOpen} onOpenChange={ResetPassword.onOpenChange} onClose={() => {
                    setOldPassword("")
                    setNewPassword("")
                    setConfirmPassword("")
                    setVisible({
                        oldPassword: false,
                        newPassword: false,
                        confirmPassword: false
                    })
                    setDoing(false)
                    setError({
                        error: false,
                        msg: ""
                    })
                    window.location.reload()
                }}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Reset Password</ModalHeader>
                                <ModalBody className="w-full flex flex-col gap-y-5">
                                    <Input
                                        label="Old Password"
                                        placeholder="Enter Old Password"
                                        type={visible.oldPassword ? "text" : "password"}
                                        labelPlacement="outside"
                                        variant="bordered"
                                        isInvalid={error.error}
                                        errorMessage={error.msg}
                                        value={oldPassword}
                                        onChange={(e) => {
                                            setOldPassword(e.target.value)
                                        }}
                                        endContent={
                                            <button className="focus:outline-none" type="button" onClick={() => {
                                                setVisible(prevVisible => ({
                                                    ...prevVisible,
                                                    oldPassword: !prevVisible.oldPassword
                                                }))
                                            }}>
                                                {visible.oldPassword ? (
                                                    <EyeSlash className="text-2xl text-default-400 pointer-events-none" />
                                                ) : (
                                                    <Eye className="text-2xl text-default-400 pointer-events-none" />
                                                )}
                                            </button>
                                        }
                                    />
                                    <Input
                                        label="New Password"
                                        placeholder="Enter New Password"
                                        type={visible.newPassword ? "text" : "password"}
                                        labelPlacement="outside"
                                        variant="bordered"
                                        value={newPassword}
                                        errorMessage={"New password must be at least 8 characters long."}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value)
                                        }}
                                        endContent={
                                            <button className="focus:outline-none" type="button" onClick={() => {
                                                setVisible(prevVisible => ({
                                                    ...prevVisible,
                                                    newPassword: !prevVisible.newPassword
                                                }))
                                            }}>
                                                {visible.newPassword ? (
                                                    <EyeSlash className="text-2xl text-default-400 pointer-events-none" />
                                                ) : (
                                                    <Eye className="text-2xl text-default-400 pointer-events-none" />
                                                )}
                                            </button>
                                        }
                                    />
                                    <Input
                                        label="Confirm New Password"
                                        placeholder="Enter New Password"
                                        type={visible.confirmPassword ? "text" : "password"}
                                        labelPlacement="outside"
                                        variant="bordered"
                                        value={confirmPassword}
                                        errorMessage={"New password must be at least 8 characters long."}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value)
                                        }}
                                        endContent={
                                            <button className="focus:outline-none" type="button" onClick={() => {
                                                setVisible(prevVisible => ({
                                                    ...prevVisible,
                                                    confirmPassword: !prevVisible.confirmPassword
                                                }))
                                            }}>
                                                {visible.confirmPassword ? (
                                                    <EyeSlash className="text-2xl text-default-400 pointer-events-none" />
                                                ) : (
                                                    <Eye className="text-2xl text-default-400 pointer-events-none" />
                                                )}
                                            </button>
                                        }
                                    />
                                </ModalBody>
                                <ModalFooter>
                                    <Button isLoading={doing} className="w-full" color="primary" isDisabled={
                                        oldPassword.length === 0 || newPassword.length === 0 || confirmPassword.length === 0 || newPassword !== confirmPassword || newPassword.length < 8
                                    } onClick={() => {
                                        handleResetPassword().then((res) => {
                                            if (res) {
                                                onClose()
                                            }
                                        })
                                    }}>
                                        {
                                            !doing ? "Reset Password" : ""
                                        }
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
                <Modal isOpen={DeleteAccount.isOpen} onOpenChange={DeleteAccount.onOpenChange} onClose={() => {
                    setOldPassword("")
                    setNewPassword("")
                    setConfirmPassword("")
                    setVisible({
                        oldPassword: false,
                        newPassword: false,
                        confirmPassword: false
                    })
                    setError({
                        error: false,
                        msg: ""
                    })
                    setDoing(false)
                    window.location.reload()
                }}>
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Delete Account</ModalHeader>
                                <ModalBody className="w-full flex flex-col gap-y-5">
                                    <p>
                                        Are you sure you want to delete your account? This action is irreversible.
                                    </p>
                                    <Input
                                        label="Password"
                                        placeholder="Enter Password"
                                        type={visible.oldPassword ? "text" : "password"}
                                        labelPlacement="outside"
                                        variant="bordered"
                                        value={oldPassword}
                                        onChange={(e) => {
                                            setOldPassword(e.target.value)
                                        }}
                                        errorMessage={error.msg}
                                        isInvalid={error.error}
                                        endContent={
                                            <button className="focus:outline-none" type="button" onClick={() => {
                                                setVisible(prevVisible => ({
                                                    ...prevVisible,
                                                    oldPassword: !prevVisible.oldPassword
                                                }))
                                            }}>
                                                {visible.oldPassword ? (
                                                    <EyeSlash className="text-2xl text-default-400 pointer-events-none" />
                                                ) : (
                                                    <Eye className="text-2xl text-default-400 pointer-events-none" />
                                                )}
                                            </button>
                                        }
                                    />
                                </ModalBody>
                                <ModalFooter>
                                    <Button isLoading={doing} className="w-full" color="danger" isDisabled={
                                        oldPassword.length === 0
                                    } onClick={() => {
                                        handleDeleteAccount().then((res) => {
                                            if (res) {
                                                onClose()
                                            }
                                        })
                                    }}>
                                        {
                                            !doing ? "Delete Account" : ""
                                        }
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </Container>
        )
    }
}