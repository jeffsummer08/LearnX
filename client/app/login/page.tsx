import Navbar from "@/components/Navbar"
import Container from "@/components/Container"

export default function Login() {
    return (
        <Container>
            <Navbar loggedIn={false} />
            <div className="flex flex-col items-center justify-center grow w-full">
                <div className="card bg-inherit shadow-none border border-inherit w-full max-w-[83.3%]">
                    <div className="card-body">
                        <div className="flex flex-col justify-center items-center">
                            <h1 className="text-4xl m-2">Login</h1>
                            <input className="input w-5/6 max-w-full m-2" type="email" placeholder="Email"></input>
                            <input className="input w-5/6 max-w-full m-2" type="password" placeholder="Password"></input>
                            <button className="btn w-5/6 m-2">Login</button>
                            <p className="m-2">or</p>
                            <div className="flex flex-row w-5/6">
                                <button className="btn w-full m-2">Login with Google</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    )
}