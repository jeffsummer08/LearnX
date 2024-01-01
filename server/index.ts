import express, { Request, Response, Express } from "express"
import authRoutes from "./routes/auth"
import contentRoutes from "./routes/content"
import session from "express-session"
import cors from "cors"
import "dotenv/config"
import { Pool } from "pg"
import connectPgSimple from "connect-pg-simple"
import { SessionOptions } from "http2"

const app: Express = express()

const dbPool = new Pool({
    connectionString: 'postgres://ogzxfpvy:1tjh3l6XGPAtGiWQQNijFU1SB8CPowoG@bubble.db.elephantsql.com/ogzxfpvy',
    max: 1
})
app.use(cors({
    origin: true,
    optionsSuccessStatus: 200,
    credentials: true
}))
app.use(express.json())

const pgSession = connectPgSimple(session)

app.use(session({
    store: new pgSession({
        pool: dbPool,
        tableName: "sessions",
        createTableIfMissing: true,
    }),
    secret: "this is a cryptographically random seed!",
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 3600 * 24}, //one day in ms
    resave: false,
    rolling: true
}))

app.use('/auth', authRoutes)
app.use('/content', contentRoutes)

app.listen(8080, () => {
    console.log("Server on http://localhost:8080")
})