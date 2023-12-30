import Nav from "../components/Nav"
import Container from "../components/Container"
import { useEffect, useState } from "react"
import validate from "../components/functions/Validate"
import Loading from "../components/Loading"
//import "../components/animations/slideIn.css"

export default function Home() {
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState<string[] | null>(null)
    const [name, setName] = useState("")
    useEffect(() => {
        validate(-1).then((res) => {
            if (res.code === 200) {
                setRole(res.data.role)
                console.log(res.data.firstName)
                setName(`${res.data.firstName} ${res.data.lastName}`)
            }
            setLoading(false)
        })
    }, [])
    if (loading) {
        return <Loading />
    } else {
        return (
            <>
                <Container>
                    <Nav role={role} name={name}></Nav>
                    <div className="flex grow flex-col items-center justify-center">
                        <p className="text-2xl slideIn">Test</p>
                    </div>
                </Container>
            </>
        )
    }
}