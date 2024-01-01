import express, {Request, Response} from "express"
import db from "../database/database"

const router = express.Router()

router.get("/course_list", (req: Request, res: Response) => {
    res.json({
        courses: {}
    })
})

router.get("/course/:course_id", (req: Request, res: Response) => {
    res.json({
        course: req.params.course_id
    })
})

router.get("/lesson/:lesson_id", (req: Request, res: Response) => {
    res.json({
        lesson: req.params.lesson_id
    })
})
export default router