import express, { Request, Response, Express } from "express"
import cors from "cors"
import "dotenv/config"

const app: Express = express()

app.use(cors())
app.use(express.json())

app.post("/auth/:type", (req: Request, res: Response) => {
    res.json({
        data: req.body,
        type: req.params.type
    })
})

app.listen(8080, () => {
    console.log("Server on http://localhost:8080")
})