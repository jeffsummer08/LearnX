import AuthForm from "../components/AuthForm";
import Nav from "../components/Nav";
import Container from "../components/Container";
import Loading from "../components/Loading";
import { useEffect, useState } from "react"

export default function Login() {
    const [loading, setLoading] = useState<boolean>(true)
    useEffect(() => {
        setLoading(false)
    }, [])
    if (loading) {
        return <Loading />
    } else {
        return (
            <Container>
                <Nav login={false} />
                <AuthForm type="login"></AuthForm>
            </Container>
        )
    }
}