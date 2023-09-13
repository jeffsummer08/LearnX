import { Generated, Selectable, Insertable, Updateable } from "kysely"

export interface StudentTable {
    id: Generated<number>
    name: string
    email: string
    passwordHash: string
    salt: string
    classes: { id: number, progress: number }[]
}

export type Student = Selectable<StudentTable>
export type NewStudent = Insertable<StudentTable>
export type UpdateStudent = Updateable<StudentTable>