import express, { Request, Response } from "express"
import db from "../database/database"
import { NewClass } from "../database/models/class"

const router = express.Router()

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
            teacher: req.session.userId,

        })
    }

})
export default router