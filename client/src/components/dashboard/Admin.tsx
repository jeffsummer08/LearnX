import { useEffect, useState } from "react"
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react"
import Loading from "../Loading"

export default function AdminDashboard() {
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        setLoading(false)
    })
    if (loading) {
        return <Loading />
    } else {
        return (
            <>
                <div className="w-full h-full flex flex-col pt-5 pl-5">
                    <h1 className="text-3xl">Manage Courses</h1>
                    <div className="flex flex-row flex-wrap gap-5">

                    </div>
                </div>
            </>
        )
    }
}