import express, { Express } from "express"
import path from "path"
import authRoutes from "./routes/auth"
import contentRoutes from "./routes/content"
import classRoutes from "./routes/classes"
import session from "express-session"
import cors from "cors"
import "dotenv/config"
import { Pool } from "pg"
import connectPgSimple from "connect-pg-simple"

const app: Express = express()
app.use(express.json({ limit: "10mb" }))
app.use(express.static(path.join(__dirname, "./client")))
app.use(express.json())
app.use("/static", express.static(path.join(__dirname, "./client/assets")))

const dbPool = new Pool({
    connectionString: process.env.DATABASE_STRING,
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
    cookie: { maxAge: 1000 * 3600 * 24 }, //one day in ms
    resave: false,
    rolling: true
}))

app.use('/auth', authRoutes)
app.use('/content', contentRoutes)
app.use('/classes', classRoutes)
app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "./client", "index.html"))
})

app.listen(8080, () => {
    console.log("Server on http://localhost:8080")
})