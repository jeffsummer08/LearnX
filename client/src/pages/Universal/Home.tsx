import Nav from "../../components/Nav"
import Container from "../../components/Container"
import { useEffect, useState } from "react"
import AccessChecker from "../../components/functions/AccessChecker"
import Loading from "../../components/Loading"
import { toast } from "react-toastify"
import "../../components/animations/slideIn.css"

export default function Home() {
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState<string[] | null>(null)
    const [name, setName] = useState("")
    useEffect(() => {
        AccessChecker(-1).then((res) => {
            if (res.code === 200) {
                setRole(res.data.role)
                setName(`${res.data.firstName} ${res.data.lastName}`)
            }
            setLoading(false)
        })
        if (window.sessionStorage.getItem("logout") === "true") {
            toast.success("Logged out successfully.", {
                position: "top-center",
                autoClose: 1500,
                hideProgressBar: true,
            })
            window.sessionStorage.removeItem("logout")
        }
    }, [])
    if (loading) {
        return <Loading />
    } else {
        return (
            <>
                <Container>
                    <Nav role={role} name={name}></Nav>
                    <div className="flex flex-col items-center justify-center w-full h-full">
                        <div className="slideIn flex flex-col items-center justify-center">
                            <img src="/LogoWoman.png" />
                            <p className="text-xl">The Future of Internet Safety</p>
                        </div>
                    </div>
                </Container>
            </>
        )
    }
}