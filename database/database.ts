import { ClassTable } from "./models/Class";
import { CourseTable } from "./models/Course";
import { StudentTable } from "./models/Student";
import { TeacherTable } from "./models/Teacher";
import { LessonTable } from "./models/Lesson";
import { createKysely } from "@vercel/postgres-kysely";

interface Database {
    Class: ClassTable
    Course: CourseTable
    Student: StudentTable
    Teacher: TeacherTable
    Lesson: LessonTable
}

const db = createKysely<Database>()

export default db