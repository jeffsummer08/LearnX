import { Generated, Selectable, Insertable, Updateable } from "kysely"

export interface TeacherTable {
    AccountId: Generated<number>
    FirstName: string
    LastName: string
    Email: string
    PasswordHash: string
    Salt: string
    ClassIds: number[]
}

export type Teacher = Selectable<TeacherTable>
export type NewTeacher = Insertable<TeacherTable>
export type TeacherUpdate = Updateable<TeacherTable>