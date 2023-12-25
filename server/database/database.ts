import { UserTable } from "./models/user";
import { ClassTable } from "./models/class";
import { Kysely, PostgresDialect } from "kysely"
import { dbPool } from "..";
import "dotenv/config"

interface Database {
    users: UserTable
    classes: ClassTable
}

// I'm not bothering with env variables
const db = new Kysely<Database>({
    dialect: new PostgresDialect({
        pool: dbPool
    }),
})

export default db