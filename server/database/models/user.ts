import {ColumnType, Generated, Selectable, Insertable, Updateable } from "kysely"

export interface UserTable {
    id: Generated<number>
    firstname: string
    lastname: string
    email: string
    passwordHash: string
    salt: string
    timestampCreated: Generated<Date>
    classes: Generated<number[]>
    isTeacher: Generated<Boolean>
    isStaff: Generated<Boolean>
    isSuperuser: Generated<Boolean>
    isValid: Generated<Boolean>
}

export type User = Selectable<UserTable>
export type NewUser = Insertable<UserTable>
export type UpdateUser = Updateable<UserTable>