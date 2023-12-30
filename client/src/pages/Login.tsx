import AuthForm from "../components/AuthForm"
import Nav from "../components/Nav"
import Container from "../components/Container"
import Loading from "../components/Loading"
import { useEffect, useState } from "react"
import validate from "../components/functions/Validate"

export default function Login() {
    const [loading, setLoading] = useState<boolean>(true)
    useEffect(() => {
        validate(-1).then((res) => {
            if (res.code === 200) {
                window.location.replace("/dashboard")
            } else {
                setLoading(false)
            }
        })
    }, [])
    if (loading) {
        return <Loading />
    } else {
        return (
            <Container>
                <Nav />
                <AuthForm type="login"></AuthForm>
            </Container>
        )
    }
}