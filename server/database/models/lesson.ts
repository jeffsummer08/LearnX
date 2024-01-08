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

export type Lesson = Selectable<LessonTable>
export type NewLesson = Insertable<LessonTable>
export type UpdateLesson = Updateable<LessonTable>