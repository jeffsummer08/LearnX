import express, {Request, Response} from "express"
import db from "../database/database"
import { initializeApp, cert } from "firebase-admin/app"
import { getDownloadURL, getStorage } from "firebase-admin/storage"
import mime from "mime-types"
import { DeleteFilesOptions, SaveOptions } from "@google-cloud/storage"
import { NewCourse, UpdateCourse } from "../database/models/course"
import { NewUnit, UpdateUnit } from "../database/models/unit"
import { NewLesson, UpdateLesson } from "../database/models/lesson"
import DOMPurify from "isomorphic-dompurify"
import { NewProgress } from "../database/models/progress"

initializeApp({
    credential: cert(require("../learnx-bpa-firebase-adminsdk-x81ds-5497ab747b.json")),
    storageBucket: "learnx-bpa.appspot.com"
})

const bucket = getStorage().bucket()
const router = express.Router()
router.get("/course-list", async (req: Request, res: Response) => {
    const query = await (await db.selectFrom("courses").selectAll().execute()).sort((a, b) => a.id - b.id)
    res.json(query.filter(val => val.isPublished || req.session.isStaff || req.session.isSuperuser).map(val => ({
        title: val.title,
        url: val.url,
        thumbnail: val.thumbnail,
        description: val.description,
        isPublished: val.isPublished,
    })))
})

router.get("/course/:course_url", async (req: Request, res: Response) => {
    const courseQuery = (await db.selectFrom("courses").selectAll().where("url", "=", req.params.course_url).execute())
    let progressQuery: any[] = []
    if(req.session.isAuthenticated){
        progressQuery = (await db.selectFrom("progress").selectAll().where("userId", "=", req.session.userId!).where("courseId", "=", courseQuery[0].id).execute()).sort((a, b) => b.timestampCreated.getTime() - a.timestampCreated.getTime())
    }
    if(courseQuery.length === 0 || !courseQuery[0].isPublished && !req.session.isStaff && !req.session.isSuperuser){
        res.status(401).json({
            msg: "Invalid course url"
        })
    }
    else{
        let unitsQuery: any[];
        if(courseQuery[0].units.length > 0){
            unitsQuery = (await db.selectFrom("units").selectAll().where("id", "in", courseQuery[0].units).execute()).sort((a, b) => a.id - b.id)
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
                    lessonsQuery = (await db.selectFrom("lessons").selectAll().where("id", "in", val.lessons).execute()).sort((a, b) => a.id - b.id)

                console.log(lessonsQuery + " " + val.title)
                return {
                    title: val.title,
                    url: val.url,
                    isPublished: val.isPublished,
                    lessons: lessonsQuery.filter(val => val.isPublished || req.session.isStaff || req.session.isSuperuser).map(val => {
                        let progressValue = -1
                        if(val.type === "quiz"){
                            for(const row of progressQuery){
                                if(row.lessonId === val.id){
                                    progressValue = row.progress
                                    break
                                }
                            }
                        }
                        return {
                            title: val.title,
                            type: val.type,
                            url: val.url,
                            progress: progressValue, 
                            isPublished: val.isPublished
                        }
                    })
                }
            }))
        })        
    }
})

router.get("/lesson/:course_url/:unit_url/:lesson_url", async (req: Request, res: Response) => {
    try{
        const courseQuery = await db.selectFrom("courses").select("units").where("url", "=", req.params.course_url).execute()
        let unitQuery: any[] = []
        if(courseQuery[0].units.length > 0)
            unitQuery = await db.selectFrom("units").select("lessons").where("id", "in", courseQuery[0].units).where("url", "=", req.params.unit_url).execute()
        let lessonQuery: any[] = []
        if(courseQuery[0].units.length > 0 && unitQuery[0].lessons.length > 0)
            lessonQuery = await db.selectFrom("lessons").selectAll().where("id", "in", unitQuery[0].lessons).where("url", "=", req.params.lesson_url).execute()

        if(lessonQuery.length === 0 || !lessonQuery[0].isPublished && !req.session.isStaff && !req.session.isSuperuser){
            res.status(401).json({
                msg: "Invalid course, unit, or lesson url/alias"
            })
        }
        else{
            let data: any = {
                title: lessonQuery[0].title,
                type: lessonQuery[0].type,
                isPublished: lessonQuery[0].isPublished,
                progress: -1
            }
            if(data.type === "article"){
                data.markdown = DOMPurify.sanitize(lessonQuery[0].content.markdown)
            }
            else if(data.type === "video"){
                data.videoUrl = lessonQuery[0].content.videoUrl
            }
            else{
                let progressValue = -1
                if(req.session.isAuthenticated){
                    const progressQuery = (await db.selectFrom("progress").select(["progress", "timestampCreated"]).where("userId", "=", req.session.userId!).where("lessonId", "=", lessonQuery[0].id).execute()).sort((a, b) => b.timestampCreated.getTime() - a.timestampCreated.getTime())
                    if(progressQuery.length > 0){
                        progressValue = progressQuery[0].progress
                    }
                }
                data.progress = progressValue
                data.questions = lessonQuery[0].content.questions
            }
            res.json(data)        
        }        
    }
    catch {
        res.status(500).json({
            msg: "Unable to get lesson"
        })
    }
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

router.post("/edit-course", async (req: Request, res: Response) => {
    if(!req.session.isStaff && !req.session.isSuperuser){
        res.sendStatus(403)
    }
    else {
        try{
            const courseQuery = await db.selectFrom("courses").selectAll().where("url", "=", req.body.url).execute()
            if(courseQuery.length !== 1){
                res.status(401).json({
                    msg: "Invalid course url"
                })
            }
            else if(!req.body.update_url.match(/^[0-9a-z-]+$/)){
                res.status(401).json({
                    msg: "Invalid update url/alias. Use url to denote the current course url and update_url to denote the new url."
                })
            }
            else{
                const courseUrlCheck = await db.selectFrom("courses").selectAll().where("url", "=", req.body.update_url).execute()
                if(courseUrlCheck.length > 0){
                    res.status(401).json({
                        msg: "Update url is taken"
                    })
                }
                else{
                    await db.updateTable("courses").where("url", "=", req.body.url).set(<UpdateCourse>{
                        title: req.body.title,
                        url: req.body.update_url,
                        thumbnail: req.body.thumbnail,
                        description: req.body.description,
                        isPublished: req.body.isPublished
                    }).execute()
                    res.status(200).json({
                        msg: "Succesfully edited course"
                    })                    
                }
            }            
        }
        catch{
            res.status(500).json({
                msg: "Unable to edit course"
            })
        }
    }
})

router.post("/delete-course", async (req: Request, res: Response) => {
    if(!req.session.isStaff && !req.session.isSuperuser){
        res.sendStatus(403)
    }
    else {
        try{
            const courseQuery = await db.selectFrom("courses").selectAll().where("url", "=", req.body.url).execute()
            if(courseQuery.length !== 1){
                res.status(401).json({
                    msg: "Invalid course url"
                })
            }
            else{
                await db.deleteFrom("courses").where("url", "=", req.body.url).execute()
                res.status(200).json({
                    msg: "Succesfully deleted course"
                })
            }            
        }
        catch{
            res.status(500).json({
                msg: "Unable to delete course"
            })
        }
    }
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
                        msg: "Unit url is taken"
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

router.post("/edit-unit", async (req: Request, res: Response) => {
    if(!req.session.isStaff && !req.session.isSuperuser){
        res.sendStatus(403)
    }
    else if(!req.body.update_url.match(/^[0-9a-z-]+$/)){
        res.status(401).json({
            msg: "Invalid update url/alias. Use url to denote the current unit url and update_url to denote the new url."
        })
    }
    else{
        try{
            const courseExistQuery = await db.selectFrom("courses").selectAll().where("url", "=", req.body.course_url).execute();
            if(courseExistQuery.length !== 1){
                res.status(401).json({
                    msg: "Invalid course url/alias, course_url"
                })
            }
            else{
                let unitExistQuery: any[] = []
                let updateUnitExistQuery: any[] = []
                if(courseExistQuery[0].units.length > 0){
                    unitExistQuery = await db.selectFrom("units").selectAll().where("id", "in", courseExistQuery[0].units).where("url", "=", req.body.url).execute()
                    updateUnitExistQuery = await db.selectFrom("units").selectAll().where("id", "in", courseExistQuery[0].units).where("url", "=", req.body.update_url).execute()
                }

                console.log(unitExistQuery)
                if(unitExistQuery.length !== 1){
                    res.status(401).json({
                        msg: "Unit does not exist"
                    })
                }
                else if(updateUnitExistQuery.length > 0){
                    res.status(401).json({
                        msg: "Update url is taken"
                    })
                }
                else{
                    await db.updateTable("units").where("id", "in", courseExistQuery[0].units).where("url", "=", req.body.url).set(<UpdateUnit> {
                        title: req.body.title,
                        url: req.body.update_url,
                        isPublished: req.body.isPublished
                    }).execute()
                    res.status(200).json({
                        msg: "Successfully edited unit"
                    })
                }
            }
        }     
        catch{
            res.status(500).json({
                msg: "Unable to edit unit"
            })
        }
    }
})

router.post("/delete-unit", async (req: Request, res: Response) => {
    if(!req.session.isStaff && !req.session.isSuperuser){
        res.sendStatus(403)
    }
    else {
        try{
            const courseQuery = await db.selectFrom("courses").selectAll().where("url", "=", req.body.course_url).execute()
            if(courseQuery.length !== 1){
                res.status(401).json({
                    msg: "Invalid course url, use course_url"
                })
            }
            else{
                const deleteQuery = await db.deleteFrom("units").where("id", "in", courseQuery[0].units).where("url", "=", req.body.url).execute()
                if(deleteQuery.length === 0){
                    res.status(401).json("Could not find unit to delete")
                }
                else{
                    res.json({
                        msg: "Successfully deleted lesson"
                    })                
                }
            }
        }
        catch{
            res.status(500).json({
                msg: "Successfully deleted unit"
            })
        }
    }
})

router.post("/create-lesson", async (req: Request, res: Response) => {
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
                    msg: "Invalid course url/alias, use course_url"
                })
            }
            else{
                let unitExistQuery: any[] = []
                if(courseExistQuery[0].units.length > 0)
                    unitExistQuery = await db.selectFrom("units").selectAll().where("id", "in", courseExistQuery[0].units).where("url", "=", req.body.unit_url).execute()
                let lessonExistQuery: any[] = []
                if(unitExistQuery[0].lessons.length > 0)
                    lessonExistQuery = await db.selectFrom("lessons").select("id").where("id", "in", unitExistQuery[0].lessons).where("url", "=", req.body.url).execute()

                if(unitExistQuery.length !== 1){
                    res.status(401).json({
                        msg: "Invalid unit url/alias, use unit_url"
                    })
                }
                else if(lessonExistQuery.length > 0){
                    res.status(401).json({
                        msg: "Lesson url is taken"
                    })
                }
                else{
                    let works = true;
                    let lessonValues: NewLesson = {
                        title: req.body.title,
                        url: req.body.url,
                        type: req.body.type
                    }
                    if(lessonValues.type === "article"){
                        lessonValues.content = {
                            markdown: req.body.markdown ? DOMPurify.sanitize(req.body.markdown) : ""
                        }                            
                    }
                    else if(lessonValues.type === "quiz"){
                        lessonValues.content = {
                            questions: req.body.questions ? req.body.questions : ""
                        }
                    }
                    else if(lessonValues.type === "video" && req.body.video_url){
                        lessonValues.content = {
                            videoUrl: req.body.video_url
                        }
                    }
                    else{
                        res.status(401).json({
                            msg: "Make sure type article lessons pass in a markdown field, type quiz lessons pass in a questions field, and type video lessons pass in a video_url field"
                        })
                        works = false
                    }
                    if(works){
                        const newLessonId = await db.insertInto("lessons").values(lessonValues).returning("id").execute()
                        await db.updateTable("units").where("id", "in", courseExistQuery[0].units).where("url", "=", req.body.unit_url).set((eb) => ({
                            lessons: eb("lessons", "||", <any>`{${newLessonId[0].id}}`)
                        })).execute()
                        res.status(201).json({
                            msg: "Successfully created lesson"
                        })                        
                    }
                }
            }
        }     
        catch{
            res.status(500).json({
                msg: "Unable to create lesson"
            })
        }
    }
})

router.post("/edit-lesson", async (req: Request, res: Response) => {
    
    if(!req.session.isStaff && !req.session.isSuperuser){
        res.sendStatus(403)
    }
    else if(!req.body.update_url.match(/^[0-9a-z-]+$/)){
        res.status(401).json({
            msg: "Invalid update url/alias. Use url to denote the current unit url and update_url to denote the new url."
        })
    }
    else if(!req.body.course_url || !req.body.unit_url || !req.body.url || !req.body.update_url){
        res.status(401).json({
            msg: "Use course_url, unit_url, url, and update_url parameters"
        })
    }
    else{
        try{
            const courseQuery = await db.selectFrom("courses").select("units").where("url", "=", req.body.course_url).execute()
            let unitQuery: any[] = []
            if(courseQuery[0].units.length > 0)
                unitQuery = await db.selectFrom("units").select("lessons").where("id", "in", courseQuery[0].units).where("url", "=", req.body.unit_url).execute()
            
            let updateLessonExistQuery: any[] = []
            if(unitQuery[0].lessons.length > 0)
                updateLessonExistQuery = await db.selectFrom("lessons").select("id").where("id", "in", unitQuery[0].lessons).where("url", "=", req.body.update_url).execute()
            let updateQuery: any[] = []
            let works = true

            if(updateLessonExistQuery.length > 0){
                res.status(401).json({
                    msg: "Update url already taken"
                })
                works = false;
            }
            else if (courseQuery[0].units.length > 0 && unitQuery[0].lessons.length > 0){
                let lessonValues: UpdateLesson = {
                    title: req.body.title,
                    url: req.body.update_url,
                    type: req.body.type,
                    isPublished: req.body.isPublished
                }
                if(lessonValues.type === "article"){
                    lessonValues.content = {
                        markdown: req.body.markdown ? DOMPurify.sanitize(req.body.markdown) : ""
                    }                            
                }
                else if(lessonValues.type === "quiz"){
                    lessonValues.content = {
                        questions: req.body.questions ? req.body.questions : ""
                    }
                }
                else if(lessonValues.type === "video" && req.body.video_url){
                    lessonValues.content = {
                        videoUrl: req.body.video_url
                    }
                }
                else{
                    res.status(401).json({
                        msg: "Make sure type article lessons pass in a markdown field, type quiz lessons pass in a questions field, and type video lessons pass in a video_url field"
                    })
                    works = false
                }
                if(works){
                    updateQuery = await db.updateTable("lessons").where("id", "in", unitQuery[0].lessons).where("url", "=", req.body.url).set(lessonValues).execute()                    
                }

            }
            if(works && updateQuery.length === 0){
                res.status(401).json("Could not find lesson to update")
            }
            else if(works){
                res.json({
                    msg: "Successfully updated lesson"
                })                
            }
        }
        catch {
            res.status(500).json({
                msg: "Unable to update lesson"
            })
        }
    }
})

router.post("/delete-lesson", async (req: Request, res: Response) => {
    if(!req.session.isStaff && !req.session.isSuperuser){
        res.sendStatus(403)
    }
    else if(!req.body.course_url || !req.body.unit_url || !req.body.url){
        res.status(401).json({
            msg: "Use course_url, unit_url, and url parameters"
        })
    }
    else {
        try{
            const courseQuery = await db.selectFrom("courses").select("units").where("url", "=", req.body.course_url).execute()
            let unitQuery: any[] = []
            if(courseQuery[0].units.length > 0)
                unitQuery = await db.selectFrom("units").select("lessons").where("id", "in", courseQuery[0].units).where("url", "=", req.body.unit_url).execute()
            
            let deleteQuery: any[] = []
            if(courseQuery[0].units.length > 0 && unitQuery[0].lessons.length > 0)
                deleteQuery = await db.deleteFrom("lessons").where("id", "in", unitQuery[0].lessons).where("url", "=", req.body.url).execute()
            
            if(deleteQuery.length === 0){
                res.status(401).json("Could not find lesson to delete")
            }
            else{
                res.json({
                    msg: "Successfully deleted lesson"
                })                
            }
        }
        catch {
            res.status(500).json({
                msg: "Unable to delete lesson"
            })
        }
    }
})

router.post("/update-lesson-progress", async (req: Request, res: Response) => {
    let progressValue = parseInt(req.body.progress)
    if(!req.session.isAuthenticated){
        res.status(401).json({
            msg: "Cannot save score as you are not logged in!"
        })
    }
    else if(isNaN(req.body.progress) || progressValue < 0 || progressValue > 100){
        res.status(401).json({
            msg: "Invalid progress"
        })
    }
    else{
        try{
            const courseQuery = await db.selectFrom("courses").select(["id", "units"]).where("url", "=", req.body.course_url).execute()
            let unitQuery: any[] = []
            if(courseQuery[0].units.length > 0)
                unitQuery = await db.selectFrom("units").select(["id", "lessons"]).where("id", "in", courseQuery[0].units).where("url", "=", req.body.unit_url).execute()
            
            let lessonQuery: any[] = []
            if(courseQuery[0].units.length > 0 && unitQuery[0].lessons.length > 0)
                lessonQuery = await db.selectFrom("lessons").select("id").where("id", "in", unitQuery[0].lessons).where("url", "=", req.body.url).execute()
            if(lessonQuery.length > 0){
                await db.insertInto("progress").values(<NewProgress> {
                    userId: req.session.userId!,
                    lessonId: lessonQuery[0].id,
                    unitId: unitQuery[0].id,
                    courseId: courseQuery[0].id,
                    progress: progressValue
                }).execute()
                res.status(201).json({
                    msg: "Succesfully updated lesson progress"
                })
            }     
        }
        catch{
            res.status(500).json({
                msg: "Unable to update lesson progress"
            })
        }
    }


})

export default router