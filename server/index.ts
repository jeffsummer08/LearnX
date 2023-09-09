import express, { Request, Response, Express } from "express"
import "dotenv/config"

const app: Express = express()



app.listen(8080, () => {
    console.log("Server on http://localhost:8080")
})