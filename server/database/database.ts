import { StudentTable } from "./models/user";
import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"
import "dotenv/config"

interface Database {
    Student: StudentTable
}

const db = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: new Pool({
            database: '	bubble.db.elephantsql.com',
            host: 'ogzxfpvy',
            user: 'ogzxfpvy',
            port: 5434,
            max: 5,
            password: '1tjh3l6XGPAtGiWQQNijFU1SB8CPowoG'
        })
    }),
})

export default db