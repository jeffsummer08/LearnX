import express, { Request, Response, Express } from "express"
import authRoutes from "./routes/auth" 

import cors from "cors"
import "dotenv/config"

const app: Express = express()

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)

app.listen(8080, () => {
    console.log("Server on http://localhost:8080")
})