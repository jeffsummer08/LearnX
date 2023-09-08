import { ReactNode } from "react"

interface Props {
    children?: ReactNode
}

export default function Container(props: Props) {
    return (
        <div className="flex flex-col h-screen w-screen max-w-full">
            {props.children}
        </div>
    )
}