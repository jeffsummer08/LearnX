import express, {Request, Response} from "express"
import db from "../database/database"

const router = express.Router()

router.get("/course_list", (req: Request, res: Response) => {
    res.json({
        courses: {}
    })
})

router.get("/course/:course_url", (req: Request, res: Response) => {
    res.json({
        course: req.params.course_id
    })
})

router.get("/lesson/:lesson_url", (req: Request, res: Response) => {
    res.json({
        lesson: req.params.lesson_id
    })
})

router.post("image_upload", (req: Request, res: Response) => {
    
})
export default router