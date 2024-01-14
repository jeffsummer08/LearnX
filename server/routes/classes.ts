import express, { Request, Response } from "express"
import db from "../database/database"
import { NewClass } from "../database/models/class"
import { join } from "path"

const router = express.Router()

function idToJoinCode(id: number, milli: number){
    let hex = (id + 999).toString(16)
    if(hex.length > 6){
        throw new Error("We have somehow surpassed the maximum class limit... classes cannot be created at this time")
    }
    return [...hex].reverse().join("") + "0".repeat(6 - hex.length) + (milli.toString() + "00").substring(0, 2)
}
async function joinCodeToId(joinCode: string){
    let hex = [...joinCode.substring(0, 6)].reverse().join("")
    let milli = joinCode.substring(6)
    let id = parseInt(hex, 16) - 999
    let milliCheck = await db.selectFrom("classes").select("timestampCreated").where("id", "=", id).execute()
    if(milliCheck.length > 0 && (milliCheck[0].timestampCreated.getMilliseconds().toString() + "00").substring(0, 2) === milli){
        return id
    }
    else{
        return -1
    }
}

router.get("/", async (req: Request, res: Response) => {
    let data: any = {}
    if(req.session.isTeacher || req.session.isStaff || req.session.isSuperuser){
        data.ownerOf = (await db.selectFrom("users").where("users.id", "=", <any> req.session.userId).innerJoin("classes", "classes.teacher", "users.id").select(["classes.id", "classes.name", "classes.students", "classes.timestampCreated"]).execute()).map(row => {
            return {
                name: row.name,
                numStudents: row.students.length,
                joinCode: idToJoinCode(row.id, row.timestampCreated.getMilliseconds())
            }
        })
    }
    res.status(200).json(data)
})

router.get("/:join_code", async (req: Request, res: Response) => {
    let classId = await joinCodeToId(req.params.join_code)
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


export default router