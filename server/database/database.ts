import { UserTable } from "./models/user";
import { ClassTable } from "./models/class";
import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"
import "dotenv/config"

interface Database {
    users: UserTable
    classes: ClassTable
}

// I'm not bothering with env variables
const db = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: 'postgres://ogzxfpvy:1tjh3l6XGPAtGiWQQNijFU1SB8CPowoG@bubble.db.elephantsql.com/ogzxfpvy',
            max: 2 //max 5, but I tried using PGAdmin simultaneously and it gave me errors, so I set to 2
        })
    }),
})

export default db