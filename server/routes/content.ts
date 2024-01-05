import express, {Request, Response} from "express"
import db from "../database/database"
import { initializeApp, cert } from "firebase-admin/app"
import { getDownloadURL, getStorage } from "firebase-admin/storage"
import mime from "mime-types"
import { DeleteFilesOptions, SaveOptions } from "@google-cloud/storage"
import { NewCourse } from "../database/models/course"

initializeApp({
    credential: cert(require("../learnx-bpa-firebase-adminsdk-x81ds-5497ab747b.json")),
    storageBucket: "learnx-bpa.appspot.com"
})

const bucket = getStorage().bucket()
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
    res.json(data)
})

router.post("/file-upload", async (req: Request, res: Response) => {
    if(!req.session.isStaff && !req.session.isSuperuser){
        res.sendStatus(403)
    }
    else{
        const fileData = req.body.fileData.replace(/^data:image\/\w+;base64,/, "")
        const fileName = req.body.fileName
        bucket.file(fileName).save(Buffer.from(fileData, "base64"), <SaveOptions> {
            public: true,
            validation: "md5",
            metadata: {
                contentType: mime.lookup(fileName)
            }
        }).then(async () => {
            res.status(201).json({
                msg: "Successfully uploaded file",
                url: await getDownloadURL(bucket.file(fileName))
            })
        }).catch(error => {
            console.log(error);
            res.status(500).json({
                msg: "Unable to upload file. Try again in a few moments."
            })
        })
    }
})

router.post("/delete-file", async (req: Request, res: Response) => {
    
})

router.post("/create-course", async (req: Request, res: Response) => {
    if(!req.session.isStaff && !req.session.isSuperuser){
        res.sendStatus(403)
    }
    else if(!req.body.url.match(/^[0-9a-z-]+$/)){
        res.status(401).json({
            msg: "Invalid url/alias"
        })
    }
    else{
        try{
            await db.insertInto("courses").values(<NewCourse> {
                title: req.body.title,
                url: req.body.url,
                thumbnail: req.body.thumbnail,
                description: req.body.description,
            })
            res.status(201).json({
                msg: "Successfully created course"
            })
        }            
        catch{
            res.status(500).json({
                msg: "Unable to create course"
            })
        }
    }
})

router.post("/edit-course", (req: Request, res: Response) => {
    
})

router.post("/delete-course", (req: Request, res: Response) => {
    
})

router.post("/create-unit", (req: Request, res: Response) => {
    
})

router.post("/edit-unit", (req: Request, res: Response) => {
    
})

router.post("/delete-unit", (req: Request, res: Response) => {
    
})

router.post("/create-lesson", (req: Request, res: Response) => {
    
})

router.post("/edit-lesson", (req: Request, res: Response) => {
    
})

router.post("/delete-lesson", (req: Request, res: Response) => {
    
})

router.post("/edit-lesson-order", (req: Request, res: Response) => {
    
})

export default router