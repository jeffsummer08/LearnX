import Container from "../components/Container"
import Nav from "../components/Nav"
import { useEffect, useState } from "react"
import AccessChecker from "../components/functions/AccessChecker"

interface Props {
    type: "404" | "500" | "403"
}

export default function Error(props: Props) {
    const [role, setRole] = useState<string[] | null>(null)
    const [name, setName] = useState<string | null>(null)
    useEffect(() => {
        AccessChecker(-1).then((res) => {
            if (res.code === 200) {
                setName(`${res.data.firstName} ${res.data.lastName}`)
                setRole(res.data.role)
            }
        })
    }, [])
    const errorMessages = {
        "404": "A 404 page means that the web page you were looking for couldn't be found. Just like in online safety, sometimes things don't go as planned, but we're here to guide you in the right direction!",
        "500": "Oops! It looks like our server encountered an issue while trying to load this page. Our team of Safety Heroes is on the case to ensure everything runs smoothly.",
        "403": "Uh-oh! Access to this page is forbidden, just like some online areas might be off-limits for safety reasons. We'll help you find the right path."
    }
    return (
        <Container>
            <Nav role={role} name={name} />
            <div className="flex flex-col grow items-center justify-center">
                <h1 className="font-normal text-7xl">{props.type}</h1>
                <p className="mt-3 text-xl text-center w-5/6 md:w-1/2">
                    {errorMessages[props.type]}
                </p>
            </div>
        </Container>
    )
}