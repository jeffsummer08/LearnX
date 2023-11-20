import {ColumnType, Generated, Selectable, Insertable, Updateable } from "kysely"

export interface ClassTable {
    id: Generated<number>
    name: string
    teacher: number
    students: number[]
    timestampCreated: ColumnType<Date, String | undefined, never>

}

export type User = Selectable<ClassTable>
export type NewUser = Insertable<ClassTable>
export type UpdateUser = Updateable<ClassTable>