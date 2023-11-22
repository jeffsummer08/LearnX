import { Input, Button, Card, CardBody } from "@nextui-org/react"
import { ChangeEvent, useState } from "react"
import client from "./instance"
import { Eye, EyeSlash, ExclamationCircle } from "react-bootstrap-icons"

interface Props {
    type: "login" | "signup"
}

export default function AuthForm(props: Props) {
    const [loading, setLoading] = useState<boolean>(false)
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
    function toggleVisibility(parameter: "password" | "confirmpassword") {
        setIsVisible(prevState => ({
            ...prevState,
            [parameter]: !prevState[parameter]
        }))
    }
    function handleChange(parameter: "firstname" | "lastname" | "email" | "confirmemail" | "password" | "confirmpassword", e: ChangeEvent<HTMLInputElement>) {
        setValues(prevState => ({
            ...prevState,
            [parameter]: e.target.value
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
    function validate(): boolean | undefined {
        let valid: boolean = true
        if (props.type === "login") {
            if (values.email === "") {
                valid = false
                createError("email", "Email is empty")
            }
            if (values.password === "") {
                valid = false
                createError("password", "Password is empty")
            }
            return valid
        } else {
            if (values.firstname === "") {
                valid = false
                createError("firstname", "First Name is empty")
            }
            if (values.lastname === "") {
                valid = false;
                createError("lastname", "Last Name is empty")
            }
            if (values.email === "") {
                valid = false
                createError("email", "Email is empty")
            } else if (!values.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                valid = false
                createError("email", "Email is invalid")
            } else {
                if (values.email !== values.confirmemail) {
                    valid = false
                    createError("confirmemail", "Emails do not match")
                    createError("email", "Emails do not match")
                }
            }
            if (values.password === "") {
                valid = false
                createError("password", "Password is empty")
            } else if (values.password.length < 8) {
                valid = false
                createError("password", "Password must be at least 8 characters long")
            } else {
                if (values.password !== values.confirmpassword) {
                    valid = false
                    createError("confirmpassword", "Passwords do not match")
                    createError("password", "Passwords do not match")
                }
            }
            return valid
        }
    }
    function handleSubmit() {
        setLoading(true)
        const valid = validate()
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
                password: values.password
            }).then(res => {
                if (res.status === 200) {
                    console.log(res.data.error)
                    if (res.data.error) {
                        setAuthError({
                            error: true,
                            msg: res.data.msg
                        })
                    } else {
                        window.location.replace("/dashboard")
                    }
                } else if (res.status === 500) {
                    setAuthError({
                        error: true,
                        msg: res.data.msg
                    })
                } else {
                    setAuthError({
                        error: true,
                        msg: "An unknown error occurred."
                    })
                }
                setLoading(false)
            }).catch(error => {
                console.error(error)
                setLoading(false)
            })
        } else {
            setLoading(false)
        }
    }
    return (
        <div className="flex grow items-center justify-center w-full h-full">
            <div className="w-5/6 lg:w-1/2 flex flex-col gap-y-7 items-center">
                <h1 className="font-normal text-3xl">{props.type === "login" ? "Login" : "Sign Up"}</h1>
                <Card className="w-full bg-red-500 text-white" style={{ display: authError.error ? "" : "none" }}>
                    <CardBody>
                        <span className="flex flex-row items-center gap-x-3">
                            <ExclamationCircle size={20} />
                            <p><b>Error:</b> {authError.msg}</p>
                        </span>
                    </CardBody>
                </Card>
                <div className={`flex gap-x-5 w-full ${props.type === "login" ? "hidden" : ""}`}>
                    <Input
                        type="text"
                        label="First Name"
                        variant="bordered"
                        onChange={(e: any) => {
                            handleChange("firstname", e)
                        }}
                        isInvalid={errors.firstname.error}
                        errorMessage={errors.firstname.error ? errors.firstname.msg : ""}

                    />
                    <Input
                        type="text"
                        label="Last Name"
                        variant="bordered"
                        onChange={(e: any) => {
                            handleChange("lastname", e)
                        }}
                        isInvalid={errors.lastname.error}
                        errorMessage={errors.lastname.error ? errors.lastname.msg : ""}
                    />
                </div>
                <Input
                    type="email"
                    label="Email"
                    variant="bordered"
                    onChange={(e: any) => handleChange("email", e)}
                    isInvalid={errors.email.error}
                    errorMessage={errors.email.error ? errors.email.msg : ""}
                />
                <Input
                    type="email"
                    label="Confirm Email"
                    variant="bordered"
                    className={props.type === "login" ? "hidden" : ""}
                    onChange={(e: any) => handleChange("confirmemail", e)}
                    isInvalid={errors.confirmemail.error}
                    errorMessage={errors.confirmemail.error ? errors.confirmemail.msg : ""}
                />
                <Input
                    type={isVisible.password ? "text" : "password"}
                    label="Password"
                    variant="bordered"
                    onChange={(e: any) => handleChange("password", e)}
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
                <Input
                    type={isVisible.confirmpassword ? "text" : "password"}
                    label="Confirm Password"
                    variant="bordered"
                    className={props.type === "login" ? "hidden" : ""}
                    onChange={(e: any) => handleChange("confirmpassword", e)}
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
                <Button onClick={handleSubmit} className="w-full" color="primary" isLoading={loading}>
                    {loading ? "" : "Submit"}
                </Button>
            </div>
        </div>
    )
}