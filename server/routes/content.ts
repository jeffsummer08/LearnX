import express, {Request, Response} from "express"
import db from "../database/database"
import { initializeApp, cert } from "firebase-admin/app"
import { getDownloadURL, getStorage } from "firebase-admin/storage"
import mime from "mime-types"
import { DeleteFilesOptions, SaveOptions } from "@google-cloud/storage"
import { NewCourse } from "../database/models/course"
import { NewUnit } from "../database/models/unit"

initializeApp({
    credential: cert(require("../learnx-bpa-firebase-adminsdk-x81ds-5497ab747b.json")),
    storageBucket: "learnx-bpa.appspot.com"
})

const bucket = getStorage().bucket()
const router = express.Router()
router.get("/course-list", async (req: Request, res: Response) => {
    const query = await db.selectFrom("courses").selectAll().execute()
    res.json(query.filter(val => val.isPublished || req.session.isStaff || req.session.isSuperuser).map(val => ({
        title: val.title,
        url: val.url,
        thumbnail: val.thumbnail,
        description: val.description,
        isPublished: val.isPublished,
    })))
})

router.get("/course/:course_url", async (req: Request, res: Response) => {
    const courseQuery = await db.selectFrom("courses").selectAll().where("url", "=", req.params.course_url).execute()
    if(courseQuery.length == 0 || !courseQuery[0].isPublished && !req.session.isStaff && !req.session.isSuperuser){
        res.status(401).json({
            msg: "Invalid course url"
        })
    }
    else{
        let unitsQuery: any[];
        if(courseQuery[0].units.length > 0){
            unitsQuery = await db.selectFrom("units").selectAll().where("id", "in", courseQuery[0].units).execute()
        }
        else{
            unitsQuery = []
        }
        res.status(200).json({
            title: courseQuery[0].title,
            thumbnail: courseQuery[0].thumbnail,
            description: courseQuery[0].description,
            isPublished: courseQuery[0].isPublished,
            units: await Promise.all(unitsQuery.filter(val => val.isPublished || req.session.isStaff || req.session.isSuperuser).map(async val => {
                let lessonsQuery: any[] = [];
                if(val.lessons.length > 0)
                    lessonsQuery = await db.selectFrom("lessons").selectAll().where("id", "in", val.lessons).execute()

                console.log(lessonsQuery + " " + val.title)
                return {
                    title: val.title,
                    url: val.url,
                    isPublished: val.isPublished,
                    lessons: lessonsQuery.filter(val => val.isPublished || req.session.isStaff || req.session.isSuperuser).map(val => ({
                        title: val.title,
                        type: val.type,
                        url: val.url
                    }))
                }
            }))
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
            const courseUrlCheck = await db.selectFrom("courses").selectAll().where("url", "=", req.body.url).execute()
            if(courseUrlCheck.length > 0){
                res.status(401).json({
                    msg: "Course url is taken"
                })
            }
            else{
                await db.insertInto("courses").values(<NewCourse> {
                    title: req.body.title,
                    url: req.body.url,
                    thumbnail: req.body.thumbnail,
                    description: req.body.description,
                }).execute()
                res.status(201).json({
                    msg: "Successfully created course"
                })                
            }
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

router.post("/create-unit", async (req: Request, res: Response) => {
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
            const courseExistQuery = await db.selectFrom("courses").selectAll().where("url", "=", req.body.course_url).execute();
            if(courseExistQuery.length !== 1){
                res.status(401).json({
                    msg: "Invalid course url/alias"
                })
            }
            else{
                let unitExistQuery: any[] = []
                if(courseExistQuery[0].units.length > 0)
                    unitExistQuery = await db.selectFrom("units").selectAll().where("id", "in", courseExistQuery[0].units).where("url", "=", req.body.url).execute()

                if(unitExistQuery.length !== 0){
                    res.status(401).json({
                        msg: "Unit already exists"
                    })
                }
                else{
                    const newUnitId = await db.insertInto("units").values(<NewUnit> {
                        title: req.body.title,
                        url: req.body.url,
                    }).returning("id").execute()
                    await db.updateTable("courses").where("courses.url", "=", req.body.course_url).set((eb) => ({
                        units: eb("units", "||", <any>`{${newUnitId[0].id}}`)
                    })).execute()
                    res.status(201).json({
                        msg: "Successfully created unit"
                    })
                }
            }
        }     
        catch{
            res.status(500).json({
                msg: "Unable to create unit"
            })
        }
    }
})
router.post("/test", (req: Request, res: Response) => {
    db.updateTable("courses").where("courses.url", "=", req.body.course_url).set((eb) => ({
        units: eb("units", "||", <any>"{6}")
    })).execute()
    res.end()
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