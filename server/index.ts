import express, { Request, Response, Express } from "express"

const app: Express = express()

app.listen(8080, () => {
    console.log("Server on http://localhost:8080")
})