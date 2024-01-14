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
        data.ownerOf = (await db.selectFrom("users").where("users.id", "=", <any> req.session.userId).innerJoin("classes", "classes.teacher", "users.id").select(["classes.id", "classes.name", "classes.students", "classes.timestampCreated"]).execute()).map(row => ({
            name: row.name,
            numStudents: row.students.length,
            joinCode: idToJoinCode(row.id, row.timestampCreated.getMilliseconds())
        }))
    }
    data.memberOf = (await db.selectFrom("classes").selectAll().where("id", "in", req.session.classes!).execute()).map(row => ({
        name: row.name,
        numStudents: row.students.length,
        joinCode: idToJoinCode(row.id, row.timestampCreated.getMilliseconds())
    }))
    res.status(200).json(data)
})

router.get("/:join_code", async (req: Request, res: Response) => {
    let classQuery = await joinCodeToClass(req.params.join_code)
    if(classQuery && (req.session.userId == classQuery.teacher || req.session.classes!.includes(classQuery.id))){
        const teacherQuery = await db.selectFrom("users").select(["firstname", "lastname"]).where("id", "=", classQuery.teacher).execute()
        const studentQuery = await db.selectFrom("users").select(["firstname", "lastname"]).where("id", "in", classQuery.students).execute()
        res.json({
            teacher: teacherQuery[0].firstname + " " + teacherQuery[0].lastname,
            students: studentQuery.map(v => v.firstname + " " + v.lastname),
            discussionCodes: [12321, 123121, 2132312, 2523541]
        })
    }
    else{
        res.status(401).json({
            msg: "Invalid join code"
        })
    }
})

router.post("/create-class/", async (req: Request, res: Response) => {
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

router.post("/delete-class/", async (req: Request, res: Response) => {
    let classQuery = await joinCodeToClass(req.body.join_code)
    if(classQuery && (classQuery.teacher == req.session.userId || req.session.isStaff || req.session.isSuperuser)){
        await db.updateTable("users").where("id", "in", classQuery.students).set((eb) => ({
            classes: sql`array_remove(classes, ${classQuery!.id})`
        })).execute()
    }
    else{
        res.status(401).json({
            msg: "Invalid join code"
        })
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
        await db.updateTable("classes").where("id", "in", classQuery.id).set(<UpdateClass> {
            name: req.body.name
        })
    }
})

export default router