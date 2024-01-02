import express, {Request, Response} from "express"
import db from "../database/database"

const router = express.Router()

router.get("/course_list", async (req: Request, res: Response) => {
    const query = await db.selectFrom("courses").selectAll().execute()
    console.log(query)
    res.json(query.filter(val => val.isPublished || req.session.isStaff || req.session.isSuperuser).map(val => {
        return {
            title: val.title,
            url: val.url,
            thumbnail: val.thumbnail,
            description: val.description,
            isPublished: val.isPublished,
        }
    }))
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

router.post("/image_upload", (req: Request, res: Response) => {
    
})

router.post("/create_course", (req: Request, res: Response) => {

})

router.post("/edit_course", (req: Request, res: Response) => {
    
})

router.post("/create_unit", (req: Request, res: Response) => {
    
})

router.post("/edit_unit", (req: Request, res: Response) => {
    
})

router.post("/create_lesson", (req: Request, res: Response) => {
    
})

router.post("/edit_lesson", (req: Request, res: Response) => {
    
})

router.post("/edit_lesson_order", (req: Request, res: Response) => {
    
})
export default router