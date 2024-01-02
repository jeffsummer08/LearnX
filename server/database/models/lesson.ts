import {ColumnType, Generated, Selectable, Insertable, Updateable, JSONColumnType } from "kysely"

export interface LessonTable {
    id: Generated<number>
    title: string
    url: string
    type: Generated<"article" | "video" | "quiz">
    timestampCreated: Generated<Date>
    content: Generated<any>
    isPublished: Generated<boolean>
    
}

export type User = Selectable<LessonTable>
export type NewUser = Insertable<LessonTable>
export type UpdateUser = Updateable<LessonTable>