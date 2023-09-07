interface NavbarProps {
    loggedIn: boolean

}

export default function Navbar(props: NavbarProps) {
    return (
        <div className='navbar sticky navbar-bordered'>
            <div className="navbar-start">
                <a className="navbar-item" href="/">LearnX</a>
            </div>
            <div className="navbar-end">
                <a className="navbar-item" href={props.loggedIn ? "/dashboard" : "/login"}>
                    {props.loggedIn ? "Dashboard" : "Login"}
                </a>
            </div>
        </div>
    )
}