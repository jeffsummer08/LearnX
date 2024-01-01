import {ColumnType, Generated, Selectable, Insertable, Updateable, JSONColumnType } from "kysely"

export interface UnitTable {
    id: Generated<number>
    title: string
    url: string
    lessons: Generated<number[]>
    timestampCreated: Generated<Date>
    isPublished: Generated<boolean>
}

export type Unit = Selectable<UnitTable>
export type NewUnit = Insertable<UnitTable>
export type UpdateUnit = Updateable<UnitTable>