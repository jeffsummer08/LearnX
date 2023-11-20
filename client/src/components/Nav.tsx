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
                    <Link href="/">
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
                            <Link href={link.href}>{link.name}</Link>
                        </NavbarItem>
                    ))
                }
            </NavbarContent>
            <NavbarContent justify="end">
                <NavbarItem>
                    <Button 
                        color="primary" 
                        as={Link}
                        href={props.login ? "/dashboard" : "/login"}
                    >
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