import Nav from "../components/Nav"
import Container from "../components/Container"
import { useEffect, useState } from "react"
import validate from "../components/functions/Validate"
//import "../components/animations/slideIn.css"

export default function Home() {
    const [login, setLogin] = useState<boolean>(false)
    const [role, setRole] = useState<string>("")
    useEffect(() => {
        validate(-1).then((res) => {
            if (res.code === 200) {
                setLogin(true)
                setRole(res.data.role)
            }
        })
    }, [])
    return (
        <>
            <Container>
                <Nav login={login} role={role}></Nav>
                <div className="flex grow flex-col items-center justify-center">
                    <p className="text-2xl slideIn">Test</p>
                </div>
            </Container>
        </>
    )
}