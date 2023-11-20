import {ColumnType, Generated, Selectable, Insertable, Updateable } from "kysely"

export interface UserTable {
    id: Generated<number>
    name: string
    email: string
    passwordHash: string
    salt: string
    timestampCreated: ColumnType<Date, String | undefined, never>
    completedLessons: number[]
    classes: number[]
    isValid: boolean
    isTeacher: boolean
    isStaff: boolean
    isSuperuser: boolean
}

export type User = Selectable<UserTable>
export type NewUser = Insertable<UserTable>
export type UpdateUser = Updateable<UserTable>