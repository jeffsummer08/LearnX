import { Input } from "@nextui-org/react"

interface Props {
    type: "login" | "signup"
}

export default function AuthForm(props: Props) {
    return (
        <div className="flex grow items-center justify-center w-full h-full">
            <div className="w-5/6 lg:w-1/2 flex flex-col gap-y-7">
                <Input
                    type="text"
                    label="First Name"
                />
                <Input
                    type="text"
                    label="Last Name"
                />
                <Input
                    type="email"
                    label="Email"
                    isRequired
                />
                <Input
                    type="email"
                    label="Confirm Email"
                    className={props.type === "login" ? "hidden" : ""}
                    isRequired
                />
                <Input
                    type="password"
                    label="Password"
                    isRequired
                />
                <Input
                    type="password"
                    label="Confirm Password"
                    className={props.type === "login" ? "hidden" : ""}
                    isRequired
                />
            </div>
        </div>
    )
}