import {Generated, Selectable, Insertable, Updateable } from "kysely"

export interface ProgressTable {
    userId: number
    lessonId: number
    unitId: number
    courseId: number    
    progress: number
    timestampCreated: Generated<Date>

}

export type Progress = Selectable<ProgressTable>
export type NewProgress = Insertable<ProgressTable>
export type UpdateProgress = Updateable<ProgressTable>