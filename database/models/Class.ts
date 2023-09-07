import { Generated, Selectable, Insertable, Updateable } from "kysely"

export interface ClassTable {
    ClassId: Generated<number>
    Name: string
    TeacherId: number
    Students: number[]
    Courses: number[]
    ClassCode: string
}

export type Class = Selectable<ClassTable>
export type NewClass = Insertable<ClassTable>
export type UpdateClass = Updateable<ClassTable>