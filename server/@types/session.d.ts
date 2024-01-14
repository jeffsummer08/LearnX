import session from "express-session"

declare module "express-session" {
    interface SessionData {
        userId: number
        isAuthenticated: boolean
        isTeacher: boolean
        isStaff: boolean
        isSuperuser: boolean
        firstName: string
        lastName: string
        classes: number[]
    }
}