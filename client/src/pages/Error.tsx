import Container from "../components/Container"
import Nav from "../components/Nav"

interface Props {
    type: "404" | "500"
}

export default function Error(props: Props) {
    const errorMessages = {
        "404": "A 404 page means that the web page you were looking for couldn't be found. Just like in online safety, sometimes things don't go as planned, but we're here to guide you in the right direction!",
        "500": "Oops! It looks like our server encountered an issue while trying to load this page. Our team of Safety Heroes is on the case to ensure everything runs smoothly."
    }
    return (
        <Container>
            <Nav login={false} />
            <div className="flex flex-col grow items-center justify-center">
                <h1 className="font-normal text-7xl">{props.type}</h1>
                <p className="mt-3 text-xl text-center w-5/6 md:w-1/2">
                    {errorMessages[props.type]}
                </p>
            </div>
        </Container>
    )
}