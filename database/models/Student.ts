import { Generated, Selectable, Insertable, Updateable } from "kysely"

export interface StudentTable {
    AccountId: Generated<number>
    FirstName: string
    LastName: string
    Email: string
    PasswordHash: string
    Salt: string
    Classes: { id: number, progress: number }[]
}

export type Student = Selectable<StudentTable>
export type NewStudent = Insertable<StudentTable>
export type StudentUpdate = Updateable<StudentTable>