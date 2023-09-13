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
            connectionString: process.env.DATABASE_URL,
        })
    }),
})

export default db