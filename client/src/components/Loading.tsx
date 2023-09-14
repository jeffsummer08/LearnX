import { Spinner } from "@nextui-org/react";

export default function Loading() {
    return (
        <div className="flex flex-col h-screen w-screen max-w-full justify-center items-center">
            <Spinner color="primary" size="lg" />
        </div>
    )
}