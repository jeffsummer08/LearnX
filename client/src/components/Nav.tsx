import { Navbar, NavbarBrand, NavbarContent, Button, NavbarItem, NavbarMenu, NavbarMenuToggle, NavbarMenuItem, Dropdown, DropdownItem, DropdownTrigger, DropdownMenu } from "@nextui-org/react"
import { Link } from "react-router-dom"
import client from "./instance"

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
        try {
            await client.get("/auth/logout")
            window.location.replace("/")
        } catch (error) {
            console.error(error)
        }
    }
    return (
        <Navbar className="border-b border-black">
            <NavbarContent>
                <NavbarMenuToggle
                    className="md:hidden"
                />
                <NavbarBrand unselectable="on">
                    <Link to="/">
                        <img
                            src="/name.png"
                            alt="Logo"
                            width="150"
                            height="75"
                        />
                    </Link>
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
                    <Dropdown isDisabled={!props.role}>
                        <DropdownTrigger>
                            <Button
                                color="primary"
                                as={Link}
                                to={props.role ? "" : "/login"}
                            >
                                {props.role ? props.name : "Login"}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                            {
                                props.role && (
                                    props.role.includes("superuser") ? (
                                        <>
                                            <DropdownItem>
                                                <Link to="/dashboard/student">
                                                    Student Dashboard
                                                </Link>
                                            </DropdownItem>
                                            <DropdownItem>
                                                <Link to="/dashboard/teacher">
                                                    Teacher Dashboard
                                                </Link>
                                            </DropdownItem>
                                            <DropdownItem>
                                                <Link to="/dashboard/staff">
                                                    Staff Dashboard
                                                </Link>
                                            </DropdownItem>
                                        </>
                                    ) as any : props.role.map((role, index) => (
                                        <DropdownItem key={index}>
                                            <Link to={`/dashboard/${role}`}>
                                                {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
                                            </Link>
                                        </DropdownItem>
                                    ))
                                )
                            }
                            <DropdownItem onClick={logout}>Logout</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </NavbarItem>
            </NavbarContent>
            <NavbarMenu>
                <NavbarMenuItem><Link to="/">Test</Link></NavbarMenuItem>
            </NavbarMenu>
        </Navbar>
    )
}