import AuthForm from "../components/AuthForm";
import Nav from "../components/Nav";
import Container from "../components/Container";

export default function Login() {
    
    return (
        <Container>
            <Nav login={false} />
            <AuthForm type="signup"></AuthForm>
        </Container>
    )
}