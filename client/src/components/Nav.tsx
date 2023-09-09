import { Navbar, NavbarBrand, NavbarContent, Button, NavbarItem, Link, NavbarMenu, NavbarMenuToggle, NavbarMenuItem } from "@nextui-org/react"

interface Props {
    login: boolean
}

export default function Nav(props: Props) {
    return (
        <Navbar className="border-b border-black">
            <NavbarContent>
                <NavbarMenuToggle
                    className="md:hidden"
                />
                <NavbarBrand>
                    {
                        // TODO: Put Logo here
                    }
                    <p className="hidden text-inherit md:flex">LearnX</p>
                </NavbarBrand>
            </NavbarContent>
            <NavbarContent justify="center" className="hidden md:flex">
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
                        {!props.login ? "Login" : "Dashboard"}
                    </Button>
                </NavbarItem>
            </NavbarContent>
            <NavbarMenu>
                <NavbarMenuItem><Link>Test</Link></NavbarMenuItem>
            </NavbarMenu>
        </Navbar>
    )
}