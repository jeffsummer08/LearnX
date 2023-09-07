import { Generated, Selectable, Insertable, Updateable } from "kysely"

export interface LessonTable {
    LessonId: Generated<number>
    Name: string
    Content: { 
        type: "video" | "article", 
        articleContent: { title: string, paragraphs: string[] } | null, 
        videoSrc: string | null 
    }
    CourseId: number
}

export type Lesson = Selectable<LessonTable>
export type NewLesson = Insertable<LessonTable>
export type UpdateLesson = Updateable<LessonTable>