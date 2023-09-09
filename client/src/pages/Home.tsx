import Nav from "../components/Nav";
import Container from "../components/Container";

export default function Home() {
    return (
        <>
            <Container>
                <Nav login={true}></Nav>
                <div className="flex grow flex-col items-center justify-center">
                    <p className="text-2xl">Test</p>
                </div>
            </Container>
        </>
    )
}