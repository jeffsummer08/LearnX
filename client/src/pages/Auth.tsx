import AuthForm from "../components/AuthForm";
import Nav from "../components/Nav";
import Container from "../components/Container";
import { useParams } from "react-router-dom"

export default function Auth() {
    const { authtype } = useParams()
    return (
        <Container>
            <Nav login={false} /> 
            <AuthForm type={authtype}></AuthForm>
        </Container>
    )
}