import AuthForm from "../components/AuthForm";
import Nav from "../components/Nav";
import Container from "../components/Container";
import { useParams } from "react-router-dom"
import Loading from "../components/Loading";
import { useEffect, useState } from "react"

export default function Auth() {
    const { authtype } = useParams()
    const [loading, setLoading] = useState<boolean>(true)
    if (authtype !== "login" && authtype !== "signup") {
        window.location.replace("/")
    }
    useEffect(() => {
        setLoading(false)
    }, [])
    if (loading) {
        return <Loading />
    } else {
        return (
            <Container>
                <Nav login={false} />
                <AuthForm type={authtype}></AuthForm>
            </Container>
        )
    }
}