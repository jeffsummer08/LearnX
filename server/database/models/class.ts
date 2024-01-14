import {ColumnType, Generated, Selectable, Insertable, Updateable } from "kysely"

export interface ClassTable {
    id: Generated<number>
    name: string
    teacher: number
    students: Generated<number[]>
    timestampCreated: Generated<Date>
}

export type Class = Selectable<ClassTable>
export type NewClass = Insertable<ClassTable>
export type UpdateClass = Updateable<ClassTable>