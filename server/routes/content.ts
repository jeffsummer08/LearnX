import express, {Request, Response} from "express"
import db from "../database/database"

const router = express.Router()

router.get("/course-list", async (req: Request, res: Response) => {
    const query = await db.selectFrom("courses").selectAll().execute()
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

router.get("/course/:course_url", async (req: Request, res: Response) => {
    const courseQuery = await db.selectFrom("courses").selectAll().where("url", "=", req.params.course_url).execute()
    if(courseQuery.length == 0 || !courseQuery[0].isPublished && !req.session.isStaff && !req.session.isSuperuser){
        res.status(401).json({
            msg: "Invalid course url"
        })
    }
    else{
        const unitsQuery = await db.selectFrom("units").selectAll().where("id", "in", courseQuery[0].units).execute()
        res.status(200).json({
            title: courseQuery[0].title,
            thumbnail: courseQuery[0].thumbnail,
            description: courseQuery[0].description,
            isPublished: courseQuery[0].isPublished,
            units: unitsQuery.filter(val => val.isPublished || req.session.isStaff || req.session.isSuperuser).map(async val => {
                const lessonsQuery = await db.selectFrom("lessons").selectAll().where("id", "in", val.lessons).execute()
                return {
                    title: val.title,
                    url: val.url,
                    isPublished: val.isPublished,
                    lessons: lessonsQuery.filter(val => val.isPublished || req.session.isStaff || req.session.isSuperuser).map(val => {
                        return {
                            title: val.title,
                            type: val.type,
                            url: val.url
                        }
                    })
                }
            })
        })        
    }
})

router.get("/lesson/:lesson_url", async (req: Request, res: Response) => {
    const lessonQuery = await db.selectFrom("lessons").selectAll().where("url", "=", req.params.lesson_url).execute()
    let data: any = {
        title: lessonQuery[0].title,
        type: lessonQuery[0].type,
        isPublished: lessonQuery[0].isPublished,
    }
    if(data.type === "article"){
        data.markdown = lessonQuery[0].content.markdown
    }
    else if(data.type === "video"){
        data.videoUrl = lessonQuery[0].content.videoUrl
    }
    else{
        data.questions = lessonQuery[0].content.questions
    }
    res.json()
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