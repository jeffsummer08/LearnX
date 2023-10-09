import { StudentTable } from "./models/user";
import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"
import "dotenv/config"

interface Database {
    student: StudentTable
}

// I'm not bothering with env variables
const db = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: 'postgres://ogzxfpvy:1tjh3l6XGPAtGiWQQNijFU1SB8CPowoG@bubble.db.elephantsql.com/ogzxfpvy',
            max: 5
        })
    }),
})

export default db