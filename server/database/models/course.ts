import {ColumnType, Generated, Selectable, Insertable, Updateable } from "kysely"

export interface CourseTable {
    id: Generated<number>
    title: string
    url: string
    thumbnail: Generated<string>
    description: Generated<string>
    units: Generated<number[]>
    timestampCreated: Generated<Date>
    isPublished: Generated<boolean>
}

export type Course = Selectable<CourseTable>
export type NewCourse = Insertable<CourseTable>
export type UpdateCourse = Updateable<CourseTable>