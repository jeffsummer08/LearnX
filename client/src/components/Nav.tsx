import { Navbar, NavbarBrand, NavbarContent, Button, NavbarItem, Link, NavbarMenu, NavbarMenuToggle, NavbarMenuItem } from "@nextui-org/react"

interface Props {
    login: boolean
}

export default function Nav(props: Props) {
    const links = [
        {
            name: "Test",
            href: "/"
        }
    ]
    return (
        <Navbar className="border-b border-black">
            <NavbarContent>
                <NavbarMenuToggle
                    className="md:hidden"
                />
                <NavbarBrand unselectable="on">
                    <Link className="text-inherit" href="/">
                        {
                            <img
                                src="/name.png"
                                alt="Logo"
                                width="150"
                                height="75"
                                className="hidden md:block"
                            />
                        }
                    </Link>
                </NavbarBrand>
            </NavbarContent>
            <NavbarContent justify="center" className="hidden md:flex">
                {
                    links.map((link, index) => (
                        <NavbarItem key={index}>
                            <Link href={link.href}>{link.name}</Link>
                        </NavbarItem>
                    ))
                }
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