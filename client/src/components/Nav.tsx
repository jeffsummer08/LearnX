import { Navbar, NavbarBrand, NavbarContent, Button, NavbarItem, NavbarMenu, NavbarMenuToggle, NavbarMenuItem, Dropdown, DropdownItem, DropdownTrigger, DropdownMenu } from "@nextui-org/react"
import { Link } from "react-router-dom"
import client from "./instance"
import { toast } from "react-toastify"


interface Props {
    role?: string[] | null
    name?: string | null
}

export default function Nav(props: Props) {

    const links = [
        {
            name: props.role,
            href: "/"
        }
    ]
    async function logout() {
        await toast.promise(
            client.get("/auth/logout"),
            {
                pending: "Logging out...",
                error: "An unexpected error occurred."
            },
            {
                position: "top-center",
                autoClose: 1500,
                hideProgressBar: true,
                closeButton: false
            }
        )
        window.sessionStorage.setItem("logout", "true")
        window.location.replace("/")
    }
    return (
        <Navbar className="border-b border-black">
            <NavbarContent>
                <NavbarMenuToggle
                    className="md:hidden"
                />
                <NavbarBrand unselectable="on" onClick={() => {
                    window.location.replace("/")
                }} className="cursor-pointer">
                    <img
                        src="/name.png"
                        alt="Logo"
                        width="150"
                        height="75"
                    />
                </NavbarBrand>
            </NavbarContent>
            <NavbarContent justify="center" className="hidden md:flex">
                {
                    links.map((link, index) => (
                        <NavbarItem key={index}>
                            <Link to={link.href}>{link.name}</Link>
                        </NavbarItem>
                    ))
                }
            </NavbarContent>
            <NavbarContent justify="end">
                <NavbarItem>
                    {
                        props.role ? (

                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        color="primary"
                                    >
                                        {props.name}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu>
                                    {
                                        props.role.includes("superuser") ? (
                                            ["staff", "teacher", "student"].map((role, index) => (
                                                <DropdownItem key={index} href={`/dashboard/${role}`}>
                                                    {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
                                                </DropdownItem>
                                            ))
                                        ) as any : props.role.map((role, index) => (
                                            <DropdownItem key={index} href={`/dashboard/${role}`}>
                                                {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
                                            </DropdownItem>
                                        ))
                                    }
                                    <DropdownItem onClick={logout}>Logout</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        ) : (
                            <Button color="primary" onClick={() => {
                                window.location.replace("/login")
                            }}>Login</Button>
                        )
                    }
                </NavbarItem>
            </NavbarContent>
            <NavbarMenu>
                <NavbarMenuItem><Link to="/">Test</Link></NavbarMenuItem>
            </NavbarMenu>
        </Navbar>
    )
}