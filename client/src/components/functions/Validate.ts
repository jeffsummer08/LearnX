export default function validate(
    values: {
        firstname: string,
        lastname: string,
        email: string,
        confirmemail: string,
        password: string,
        confirmpassword: string
    },
    type: "login" | "signup",
    createError: any
) {
    let valid: boolean = true
    if (type === "login") {
        if (values.email.trim() === "") {
            valid = false
            createError("email", "Email is empty")
        }
        if (values.password.trim() === "") {
            valid = false
            createError("password", "Password is empty")
        }
        return valid
    } else {
        if (values.firstname.trim() === "") {
            valid = false
            createError("firstname", "First Name is empty")
        }
        if (values.lastname.trim() === "") {
            valid = false
            createError("lastname", "Last Name is empty")
        }
        if (values.email.trim() === "") {
            valid = false
            createError("email", "Email is empty")
        } else if (!values.email.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            valid = false
            createError("email", "Email is invalid")
        } else {
            if (values.email.trim() !== values.confirmemail.trim()) {
                valid = false
                createError("confirmemail", "Emails do not match")
                createError("email", "Emails do not match")
            }
        }
        if (values.password.trim() === "") {
            valid = false
            createError("password", "Password is empty")
        } else if (values.password.length < 8) {
            valid = false
            createError("password", "Password must be at least 8 characters long")
        } else {
            if (values.password.trim() !== values.confirmpassword.trim()) {
                valid = false
                createError("confirmpassword", "Passwords do not match")
                createError("password", "Passwords do not match")
            }
        }
        return valid
    }
}