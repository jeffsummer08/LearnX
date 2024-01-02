import { UserTable } from "./models/user";
import { ClassTable } from "./models/class";
import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg";
import "dotenv/config"
import { CourseTable } from "./models/course";
import { UnitTable } from "./models/unit";
import { LessonTable } from "./models/lesson";

interface Database {
    users: UserTable
    classes: ClassTable
    courses: CourseTable
    units: UnitTable
    lessons: LessonTable
}

// I'm not bothering with env variables
const db = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: 'postgres://ogzxfpvy:1tjh3l6XGPAtGiWQQNijFU1SB8CPowoG@bubble.db.elephantsql.com/ogzxfpvy',
            max: 1
        })
    }),
})

export default db