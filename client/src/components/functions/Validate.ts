import getUser from "./GetUser"

export default async function validate(role: number) {
    const user = await getUser()
    let userRole = {
        role: "",
        level: -1,
        firstName: user.firstName,
        lastName: user.lastName
    }
    if (user.error) {
        return {
            data: userRole,
            code: 500
        }
    } else {
        if (user.isAuthenticated) {
            if (user.isSuperuser) {
                userRole.role = "superuser"
                userRole.level = 3
            } else if (user.isStaff) {
                userRole.role = "staff"
                userRole.level = 2
            } else if (user.isTeacher) {
                userRole.role = "teacher"
                userRole.level = 1
            } else {
                userRole.role = "student"
                userRole.level = 0
            }
            if (role > userRole.level) {
                return {
                    data: userRole,
                    code: 403
                }
            } else {
                return {
                    data: userRole,
                    code: 200
                }
            }
        } else {
            return {
                data: userRole,
                code: 401
            }
        }
    }
}