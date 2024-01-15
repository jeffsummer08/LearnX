"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kysely_1 = require("kysely");
const pg_1 = require("pg");
require("dotenv/config");
require("dotenv/config");
// I'm not bothering with env variables
const db = new kysely_1.Kysely({
    dialect: new kysely_1.PostgresDialect({
        pool: new pg_1.Pool({
            connectionString: process.env.DATABASE_STRING,
            max: 1
        })
    }),
});
exports.default = db;
