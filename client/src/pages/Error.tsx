import Container from "../components/Container"
import Nav from "../components/Nav"

export default function Error() {
    return (
        <Container>
            <Nav login={false} />
            <div className="flex flex-col grow items-center justify-center">
                <h1 className="font-normal text-7xl">404</h1>
                <p className="mt-3 text-xl text-center w-5/6 md:w-1/2">
                    A 404 page means that the web page you were looking for couldn't be found. Just like in online safety, sometimes things don't go as planned, but we're here to guide you in the right direction!
                </p>
            </div>
        </Container>
    )
}