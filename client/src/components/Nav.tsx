import { Navbar, NavbarBrand, NavbarContent, Button, NavbarItem, Link } from "@nextui-org/react"

interface Props {
    login: boolean
}

export default function Nav(props: Props) {
    return (
        <Navbar className="border-b border-black">
            <NavbarBrand>
                {
                    // TODO: Put Logo here
                }
                <p className="text-inherit">LearnX</p>
            </NavbarBrand>
            <NavbarContent justify="center">
                <NavbarItem>
                    <Link>
                        Test
                    </Link>
                    {
                        // TODO: Put links
                    }
                </NavbarItem>
            </NavbarContent>
            <NavbarContent justify="end">
                <NavbarItem>
                    <Button>
                        { !props.login ? "Login" : "Dashboard" }
                    </Button>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    )
}