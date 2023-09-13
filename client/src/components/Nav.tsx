import { Navbar, NavbarBrand, NavbarContent, Button, NavbarItem, Link, NavbarMenu, NavbarMenuToggle, NavbarMenuItem } from "@nextui-org/react"
import { Link as LinkTo } from "react-router-dom"

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
                <NavbarBrand unselectable="on">
                    <LinkTo to="/">
                        {
                            // TODO: Put Logo here
                        }
                        <p className="hidden text-inherit md:flex">LearnX</p>
                    </LinkTo>
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
                    <Button href={!props.login ? "/auth/login" : "/dashboard"}>
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