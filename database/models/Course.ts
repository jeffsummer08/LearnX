import { Generated, Selectable, Insertable, Updateable } from "kysely"

export interface CourseTable {
    CourseId: Generated<number>
    Name: string
    Description: string
    Lessons: number[]
}

export type Course = Selectable<CourseTable>
export type NewCourse = Insertable<CourseTable>
export type UpdateCourse = Updateable<CourseTable>