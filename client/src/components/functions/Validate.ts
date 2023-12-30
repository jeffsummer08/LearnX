import getUser from "./GetUser"

export default async function validate(role: number) {
    try {
        const user = await getUser()
        let userRole: { role: string[], level: number, firstName: string, lastName: string } = {
            role: [],
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
                    userRole.role.push("superuser")
                    userRole.level = 3
                }
                if (user.isStaff) {
                    userRole.role.push("staff")
                    if (userRole.level < 2) {
                        userRole.level = 2
                    }
                }
                if (user.isTeacher) {
                    userRole.role.push("teacher")
                    if (userRole.level < 1) {
                        userRole.level = 1
                    }
                } 
                if (!user.isTeacher && !user.isStaff && !user.isSuperuser) {
                    userRole.role.push("student")
                    if (userRole.level < 0) {
                        userRole.level = 0
                    }
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
    } catch (error) {
        return {
            data: {
                role: [],
                level: -1,
                firstName: "",
                lastName: ""
            },
            code: 500
        }
    }
}