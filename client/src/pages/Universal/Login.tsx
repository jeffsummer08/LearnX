import AuthForm from "../../components/AuthForm"
import Nav from "../../components/Nav"
import Container from "../../components/Container"
import Loading from "../../components/Loading"
import { useEffect, useState } from "react"
import AccessChecker from "../../components/functions/AccessChecker"


export default function Login() {
    
    const [loading, setLoading] = useState<boolean>(true)
    useEffect(() => {
        AccessChecker(-1).then((res) => {
            if (res.code === 200) {
                window.location.assign("/dashboard")
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