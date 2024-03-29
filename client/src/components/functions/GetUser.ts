import client from "../instance"

export default async function GetUser() {
    try {
        const res = await client.get("/auth/user")
        return {
            isAuthenticated: res.data.isAuthenticated as boolean,
            isTeacher: res.data.isTeacher as boolean,
            isStaff: res.data.isStaff as boolean,
            isSuperuser: res.data.isSuperuser as boolean,
            firstName: res.data.firstName as string,
            lastName: res.data.lastName as string,
            error: false
        }
    } catch (error) {
        console.error(error)
        return {
            isAuthenticated: false,
            isTeacher: false,
            isStaff: false,
            isSuperuser: false,
            firstName: "",
            lastName: "",
            error: true
        }
    }
}