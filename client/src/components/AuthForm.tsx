import { Input, Button } from "@nextui-org/react"
import { ChangeEvent, useState } from "react"
import axios from "axios"

interface Props {
    type: string | undefined
}

export default function AuthForm(props: Props) {
    const [loading, setLoading] = useState<boolean>(false)
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
                createError("email", "Field is empty")
            }
            if (values.password === "") {
                valid = false
                createError("password", "Field is empty")
            }
            return valid
        } else {
            if (values.firstname === "") {
                valid = false
                createError("firstname", "Field is empty")
            }
            if (values.lastname === "") {
                valid = false
                createError("lastname", "Field is empty")
            }
            if (values.email === "") {
                valid = false
                createError("email", "Field is empty")
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
                createError("password", "Field is empty")
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
            axios.post(`http://localhost:8080/auth/${props.type}`, {
                firstname: values.firstname,
                lastname: values.lastname,
                email: values.email,
                password: values.password
            }).then(res => {
                console.log(res.data)
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
                <div className={`flex gap-x-5 w-full ${props.type === "login" ? "hidden" : ""}`}>
                    <Input
                        type="text"
                        label="First Name"
                        variant="bordered"
                        onChange={(e) => {
                            handleChange("firstname", e)
                        }}
                        errorMessage={errors.firstname.error ? errors.firstname.msg : ""}


                    />
                    <Input
                        type="text"
                        label="Last Name"
                        variant="bordered"
                        onChange={(e) => {
                            handleChange("lastname", e)
                        }}
                        errorMessage={errors.lastname.error ? errors.lastname.msg : ""}
                    />
                </div>
                <Input
                    type="email"
                    label="Email"
                    variant="bordered"
                    onChange={(e) => {
                        handleChange("email", e)
                    }}
                    isRequired
                    errorMessage={errors.email.error ? errors.email.msg : ""}
                />
                <Input
                    type="email"
                    label="Confirm Email"
                    variant="bordered"
                    className={props.type === "login" ? "hidden" : ""}
                    onChange={(e) => {
                        handleChange("confirmemail", e)
                    }}
                    isRequired
                    errorMessage={errors.confirmemail.error ? errors.confirmemail.msg : ""}
                />
                <Input
                    type="password"
                    label="Password"
                    variant="bordered"
                    onChange={(e) => {
                        handleChange("password", e)
                    }}
                    isRequired
                    errorMessage={errors.password.error ? errors.password.msg : ""}
                />
                <Input
                    type="password"
                    label="Confirm Password"
                    variant="bordered"
                    className={props.type === "login" ? "hidden" : ""}
                    onChange={(e) => {
                        handleChange("confirmpassword", e)
                    }}
                    isRequired
                    errorMessage={errors.confirmpassword.error ? errors.confirmpassword.msg : ""}
                />
                <Button onPress={handleSubmit} className="w-full" color="primary" isLoading={loading}>
                    {loading ? "" : "Submit"}
                </Button>
            </div>
        </div>
    )
}