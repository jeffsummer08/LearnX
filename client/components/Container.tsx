import { ReactNode } from "react"

interface ContainerProps {
    children: ReactNode
}

export default function Container(props: ContainerProps) {
    return (
        <div className="h-screen w-screen max-w-full flex flex-col">
            {props.children}
        </div>
    )
}