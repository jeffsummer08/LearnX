import express, { Request, Response } from "express"
import db from "../database/database"
import { NewClass } from "../database/models/class"

const router = express.Router()

router.get("/", async (req: Request, res: Response) => {
    let data: any = {}
    if(req.session.isTeacher || !req.session.isStaff || !req.session.isSuperuser){
        data.ownerOf = (await db.selectFrom("users").where("id", "=", <any> req.session.userId).innerJoin("classes", "classes.teacher", "users.id").select(["classes.id", "classes.name", "classes.students", "classes.timestampCreated"]).execute()).map(row => {
            let code = row.id.toString(16)
            return {
                name: row.name,
                numStudents: row.students.length,
                joinCode: "0".repeat(code.length <= 6 ? 6 - code.length : 0) + code
            }
        })
    }
})

router.get("/:join_code", (req: Request, res: Response) => {
    let courseId = req.params.join_code
})

router.post("/create-class/", async (req: Request, res: Response) => {
    if(!req.session.isTeacher || !req.session.isStaff || !req.session.isSuperuser){
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
        db.insertInto("classes").values(<NewClass> {
            name: req.body.name,
            teacher: req.session.userId
        })
    }
})


export default router