import Nav from "../components/Nav"
import Container from "../components/Container"
//import "../components/animations/slideIn.css"

export default function Home() {
    return (
        <>
            <Container>
                <Nav login={true}></Nav>
                <div className="flex grow flex-col items-center justify-center">
                    <p className="text-2xl slideIn">Test</p>
                </div>
            </Container>
        </>
    )
}