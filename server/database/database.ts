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
            database: 'ogzxfpvy',
            host: 'bubble.db.elephantsql.com',
            user: 'ogzxfpvy',
            passowrd: '1tjh3l6XGPAtGiWQQNijFU1SB8CPowoG',
            port: 5432,
            max: 5, //elephantsql allows 5 max for free tier
        })
    }),
})

export default db