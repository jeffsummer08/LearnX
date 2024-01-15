import { Input, Button, Card, CardBody } from "@nextui-org/react"
import { useState, useEffect, ChangeEvent } from "react"
import getUser from "./functions/GetUser"
import client from "./instance"
import { Eye, EyeSlash, ExclamationCircle } from "react-bootstrap-icons"
import Loading from "./Loading"
import validate from "./functions/Validate"

interface Props {
    type: "login" | "signup",
    for?: "student" | "teacher"
}

export default function AuthForm(props: Props) {
    const [loading, setLoading] = useState<boolean>(false)
    const [ready, setReady] = useState<boolean>(false)
    const [isVisible, setIsVisible] = useState({
        password: false,
        confirmpassword: false
    })
    const [values, setValues] = useState({
        firstname: "",
        lastname: "",
        email: "",
        confirmemail: "",
        password: "",
        confirmpassword: ""
    })
    const [errors, setErrors] = useState({
        firstname: {
            error: false,
            msg: ""
        },
        lastname: {
            error: false,
            msg: ""
        },
        email: {
            error: false,
            msg: ""
        },
        confirmemail: {
            error: false,
            msg: ""
        },
        password: {
            error: false,
            msg: ""
        },
        confirmpassword: {
            error: false,
            msg: ""
        }
    })
    const [authError, setAuthError] = useState({
        error: false,
        msg: ""
    })
    useEffect(() => {
        getUser().then((user) => {
            if (user.error) {
                window.location.assign("/error")
            } else {
                if (user.isAuthenticated) {
                    window.location.assign("/dashboard")
                } else {
                    setReady(true)
                }
            }
        })
    }, [])
    function toggleVisibility(parameter: "password" | "confirmpassword") {
        setIsVisible(prevState => ({
            ...prevState,
            [parameter]: !prevState[parameter]
        }))
    }
    function handleChange(parameter: "firstname" | "lastname" | "email" | "confirmemail" | "password" | "confirmpassword", e: ChangeEvent<HTMLInputElement>) {
        const value = e.target.value
        setValues(prevState => ({
            ...prevState,
            [parameter]: value
        }))
        setErrors(prevState => ({
            ...prevState,
            [parameter]: {
                error: false,
                msg: ""
            }
        }))
    }
    function createError(parameter: "firstname" | "lastname" | "email" | "confirmemail" | "password" | "confirmpassword", errorMsg: string) {
        setErrors(prevState => ({
            ...prevState,
            [parameter]: {
                error: true,
                msg: errorMsg
            }
        }))
    }
    function handleSubmit() {
        setLoading(true)
        const valid = validate(values, props.type, createError)
        if (valid) {
            setErrors({
                firstname: {
                    error: false,
                    msg: ""
                },
                lastname: {
                    error: false,
                    msg: ""
                },
                email: {
                    error: false,
                    msg: ""
                },
                confirmemail: {
                    error: false,
                    msg: ""
                },
                password: {
                    error: false,
                    msg: ""
                },
                confirmpassword: {
                    error: false,
                    msg: ""
                }
            })
            client.post(`/auth/${props.type}`, {
                firstname: values.firstname,
                lastname: values.lastname,
                email: values.email,
                password: values.password,
                isTeacher: props.type === "signup" ? props.for === "teacher" : false
            }).then(() => {
                window.location.assign("/dashboard")
            }).catch(error => {
                if (error.response.data.msg) {
                    setAuthError({
                        error: true,
                        msg: error.response.data.msg
                    })
                }
                else {
                    setAuthError({
                        error: true,
                        msg: "An unknown error occured"
                    })
                    console.error(error)
                }
                setLoading(false)
            })
        } else {
            setLoading(false)
        }
    }
    if (ready) {
        return (
            <div className="flex grow items-center justify-center w-full h-full" onKeyDown={(e) => {
                if (e.key === "Enter") {
                    handleSubmit()
                }
            }}>
                <div className="w-5/6 lg:w-1/2 flex flex-col gap-y-7 items-center">
                    <h1 className="font-normal text-3xl">{props.type === "login" ? "Login" : props.for === "student" ? "Student Sign Up" : "Teacher Sign Up"}</h1>
                    <Card className="w-full bg-red-500 text-white" style={{ display: authError.error ? "" : "none" }}>
                        <CardBody>
                            <span className="flex flex-row items-center gap-x-3">
                                <ExclamationCircle size={20} />
                                <p><b>Error:</b> {authError.msg}</p>
                            </span>
                        </CardBody>
                    </Card>
                    {
                        props.type === "signup" ? (
                            <div className="flex gap-x-5 w-full">
                                <Input
                                    type="text"
                                    label="First Name"
                                    variant="bordered"
                                    onChange={(e) => {
                                        handleChange("firstname", e)
                                    }}
                                    isInvalid={errors.firstname.error}
                                    errorMessage={errors.firstname.error ? errors.firstname.msg : ""}
                                />
                                <Input
                                    type="text"
                                    label="Last Name"
                                    variant="bordered"
                                    onChange={(e) => {
                                        handleChange("lastname", e)
                                    }}
                                    isInvalid={errors.lastname.error}
                                    errorMessage={errors.lastname.error ? errors.lastname.msg : ""}
                                />
                            </div>
                        ) : (
                            <></>
                        )
                    }
                    <Input
                        type="email"
                        label="Email"
                        variant="bordered"
                        onChange={(e) => handleChange("email", e)}
                        isInvalid={errors.email.error}
                        errorMessage={errors.email.error ? errors.email.msg : ""}
                    />
                    {
                        props.type === "signup" ? (
                            <Input
                                type="email"
                                label="Confirm Email"
                                variant="bordered"
                                onChange={(e) => handleChange("confirmemail", e)}
                                isInvalid={errors.confirmemail.error}
                                errorMessage={errors.confirmemail.error ? errors.confirmemail.msg : ""}
                            />
                        ) : (
                            <></>
                        )
                    }
                    <Input
                        type={isVisible.password ? "text" : "password"}
                        label="Password"
                        variant="bordered"
                        onChange={(e) => handleChange("password", e)}
                        endContent={
                            <button className="focus:outline-none" type="button" onClick={() => {
                                toggleVisibility("password")
                            }}>
                                {isVisible.password ? (
                                    <EyeSlash className="text-2xl text-default-400 pointer-events-none" />
                                ) : (
                                    <Eye className="text-2xl text-default-400 pointer-events-none" />
                                )}
                            </button>
                        }
                        isInvalid={errors.password.error}
                        errorMessage={errors.password.error ? errors.password.msg : ""}
                    />
                    {
                        props.type === "signup" ? (
                            <Input
                                type={isVisible.confirmpassword ? "text" : "password"}
                                label="Confirm Password"
                                variant="bordered"
                                onChange={(e) => handleChange("confirmpassword", e)}
                                endContent={
                                    <button className="focus:outline-none" type="button" onClick={() => {
                                        toggleVisibility("confirmpassword")
                                    }}>
                                        {isVisible.confirmpassword ? (
                                            <EyeSlash className="text-2xl text-default-400 pointer-events-none" />
                                        ) : (
                                            <Eye className="text-2xl text-default-400 pointer-events-none" />
                                        )}
                                    </button>
                                }
                                isInvalid={errors.confirmpassword.error}
                                errorMessage={errors.confirmpassword.error ? errors.confirmpassword.msg : ""}
                            />
                        ) : (
                            <></>
                        )
                    }
                    <Button onClick={handleSubmit} className="w-full" color="primary" isLoading={loading}>
                        {loading ? "" : "Submit"}
                    </Button>
                    <p>
                        {
                            props.type === "login" ? (
                                <div className="flex flex-col items-center gap-y-3">
                                    <p>Don't have an account?</p>
                                    <p>
                                        <a href="/student/signup" className="text-primary">Sign Up as a Student</a> or <a href="/teacher/signup" className="text-[#DB27F2]">Sign Up as a Teacher</a>
                                    </p>
                                </div>
                            ) : (
                                <>
                                    Already have an account? <a href="/login" className="text-primary">Login</a>
                                </>
                            )
                        }
                    </p>
                </div>
            </div>
        )
    } else {
        return <Loading />
    }
}