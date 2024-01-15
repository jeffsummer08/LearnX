import express, { Request, Response } from "express"
import db from "../database/database"
import { NewClass, UpdateClass } from "../database/models/class"
import { join } from "path"
import { sql } from "kysely"

const router = express.Router()

function idToJoinCode(id: number, milli: number){
    let hex = (id + 999).toString(16)
    if(hex.length > 6){
        throw new Error("We have somehow surpassed the maximum discussion or class limit... classes cannot be created at this time")
    }
    return [...hex].reverse().join("") + "0".repeat(6 - hex.length) + (milli.toString() + "00").substring(0, 2)
}
async function joinCodeToClass(joinCode: string){
    let hex = [...joinCode.substring(0, 6)].reverse().join("")
    let milli = joinCode.substring(6)
    let id = parseInt(hex, 16) - 999
    let milliCheck = await db.selectFrom("classes").selectAll().where("id", "=", id).execute()
    if(milliCheck.length > 0 && (milliCheck[0].timestampCreated.getMilliseconds().toString() + "00").substring(0, 2) === milli){
        return milliCheck[0]
    }
    else{
        return null
    }
}

router.get("/", async (req: Request, res: Response) => {
    let data: any = {
        ownerOf: {},
        memberOf: {}
    }
    if(req.session.isTeacher || req.session.isStaff || req.session.isSuperuser){
        const ownedClassQuery = (await db.selectFrom("users").where("users.id", "=", req.session.userId!).innerJoin("classes", "classes.teacher", "users.id")
            .select(["classes.id", "classes.name", "classes.students", "classes.timestampCreated"]).execute()).sort((a, b) => b.timestampCreated.getTime() - a.timestampCreated.getTime())
        data.ownerOf = ownedClassQuery.map(row => ({
            name: row.name,
            numStudents: row.students.length,
            joinCode: idToJoinCode(row.id, row.timestampCreated.getMilliseconds())
        }))
    }
    if(req.session.isAuthenticated){
        let classQuery: any = []
        if(req.session.classes!.length > 0)
            classQuery = await db.selectFrom("classes").selectAll().where("id", "in", req.session.classes!).execute()

        data.memberOf = classQuery.map((row: any) => ({
            name: row.name,
            numStudents: row.students.length,
            joinCode: idToJoinCode(row.id, row.timestampCreated.getMilliseconds())
        }))  
    }

    res.status(200).json(data)
})

router.get("/:join_code", async (req: Request, res: Response) => {
    let classQuery = await joinCodeToClass(req.params.join_code)
    if(classQuery && (req.session.userId == classQuery.teacher || req.session.classes!.includes(classQuery.id) || req.session.isStaff || req.session.isSuperuser)){
        const teacherQuery = await db.selectFrom("users").select(["id", "firstname", "lastname"]).where("id", "=", classQuery.teacher).execute()
        let studentQuery: any[] = []
        if(classQuery.students.length > 0)
            studentQuery = await db.selectFrom("users").select(["id", "firstname", "lastname"]).where("id", "in", classQuery.students).execute()
        res.json({
            teacher: teacherQuery[0].firstname + " " + teacherQuery[0].lastname,
            students: studentQuery.map(v => ({
                id: v.id,
                name: v.firstname + " " + v.lastname
            })),
            hasManagePermissions: req.session.userId == classQuery.teacher || req.session.isStaff || req.session.isSuperuser,
            discussionCodes: [12321, 123121, 2132312, 2523541]
        })
    }
    else{
        res.status(401).json({
            msg: "Invalid join code"
        })
    }
})

router.get("/:join_code/view/:student_id", async (req: Request, res: Response) => {
    let classQuery = await joinCodeToClass(req.params.join_code)
    if(!classQuery || req.session.userId != classQuery.teacher && !req.session.classes!.includes(classQuery.id) && !req.session.isStaff && !req.session.isSuperuser){
        res.status(401).json({
            msg: "Invalid join code"
        })
    }
    else if(req.session.userId != classQuery.teacher && !req.session.isStaff && !req.session.isSuperuser){
        res.sendStatus(403)
    }
    else if(!classQuery.students.includes(parseInt(req.params.student_id))){
        res.sendStatus(401).json({
            msg: "User is not in your class"
        })
    }
    else{
        const progressQuery = await db.selectFrom("users").where("id", "=", parseInt(req.params.student_id))
            .innerJoin("progress as p", "users.id", "p.userId")
            .innerJoin("courses as c", "p.courseId", "c.id")
            .innerJoin("lessons as l", "p.lessonId", "l.id")
            .innerJoin("units as u", "p.unitId", "u.id")
            .select(["users.firstname", "users.lastname", "c.url as course_url", "u.url as unit_url", "l.url as lesson_url", "p.progress", "p.timestampCreated"]).execute()
        res.json({
            student: progressQuery[0].firstname + " " + progressQuery[0].lastname,
            history: progressQuery.map(val => ({
                student: val.firstname + " " + val.lastname,
                course_url: val.course_url,
                unit_url: val.unit_url,
                lesson_url: val.lesson_url,
                progress: val.progress,
                timestamp: val.timestampCreated
            }))
        })
    }
})

router.post("/create-class", async (req: Request, res: Response) => {
    if(!req.session.isTeacher && !req.session.isStaff && !req.session.isSuperuser){
        res.status(403).json({
            msg: "You must be a teacher to create a class"
        })
    }
    else if(req.body.name.length > 100){
        res.status(401).json({
            msg: "Class name must be less than 100 characters"
        })
    }
    else{
        await db.insertInto("classes").values(<NewClass> {
            name: req.body.name,
            teacher: req.session.userId
        }).execute()
        res.status(201).json({
            msg: "Succesfully created class!"
        })
    }
})

router.post("/delete-class", async (req: Request, res: Response) => {
    let classQuery = await joinCodeToClass(req.body.join_code)
    if(classQuery && (classQuery.teacher == req.session.userId || req.session.isStaff || req.session.isSuperuser)){
        if(classQuery.students.length > 0){
            await db.updateTable("users").where("id", "in", classQuery.students).set((eb) => ({
                classes: sql`array_remove(classes, ${classQuery!.id})`
            })).execute()    
        }
        await db.deleteFrom("classes").where("id", "=", classQuery.id).execute()
        res.json({
            msg: "Succesfully deleted class"
        })
        
    }
    else{
        res.status(401).json({
            msg: "Invalid join code"
        })
    }
})

router.post("/ban-student/", async (req: Request, res: Response) => {
    let classQuery = await joinCodeToClass(req.body.join_code)
    if(!classQuery || req.session.userId != classQuery.teacher && !req.session.classes!.includes(classQuery.id) && !req.session.isStaff && !req.session.isSuperuser){
        res.status(401).json({
            msg: "Invalid join code"
        })
    }
    else if(req.session.userId != classQuery.teacher && !req.session.isStaff && !req.session.isSuperuser){
        res.sendStatus(403)
    }
    else if(!classQuery.students.includes(parseInt(req.body.student_id))){
        res.sendStatus(401).json({
            msg: "User is not in your class"
        })
    }
    else{
        await db.updateTable("users").where("id", "=", classQuery.students).set((eb) => ({
            classes: sql`array_remove(classes, ${classQuery!.id})`
        })).execute()
        await db.updateTable("users").where("id", "=", classQuery.students).set((eb) => ({
            classes: eb("classes", "||", <any>`{${-classQuery!.id}}`)
        })).execute()
    }
})

router.post("/edit-class", async (req: Request, res: Response) => {
    let classQuery = await joinCodeToClass(req.body.join_code)
    if(!classQuery || classQuery.teacher != req.session.userId && !req.session.isStaff && !req.session.isSuperuser){
        res.status(401).json({
            msg: "Invalid join code"
        })
    }
    else if(req.body.name.length > 100){
        res.status(401).json({
            msg: "Class name must be less than 100 characters"
        })
    }
    else{
        await db.updateTable("classes").where("id", "=", classQuery.id).set(<UpdateClass> {
            name: req.body.name
        }).execute()
        res.json({
            msg: "Succesfully edited class"
        })
    }
})

router.post("/join-class", async (req: Request, res: Response) => {
    let classQuery = await joinCodeToClass(req.body.join_code)
    if(!req.session.isAuthenticated){
        res.status(401).json({
            msg: "You must be logged in to join a class"
        })
    }
    else if(!classQuery || req.session.classes!.includes(-classQuery.id)){
        res.status(401).json({
            msg: "Invalid join code"
        })
    }
    else if(classQuery.teacher === req.session.userId){
        res.status(401).json({
            msg: "You're the teacher!"
        })
    }
    else{
        const classRes = await db.updateTable("classes").where("id", "=", classQuery.id).set((eb) => ({
            students: eb("students", "||", <any>`{${req.session.userId}}`)
        })).execute()
        await db.updateTable("users").where("id", "=", req.session.userId!).set((eb) => ({
            classes: eb("classes", "||", <any>`{${classQuery!.id}}`)
        })).execute()
        if(classRes.length === 1){
            req.session.classes!.push(classQuery.id)
            res.json({
                msg: "Succesfully joined class"
            })
        }
        else{
            res.status(500).json({
                msg: "Unexpected error occured while joining class"
            })
        }
    }
})
export default router