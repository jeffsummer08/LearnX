import express, { Request, Response } from "express"
import db from "../database/database"

const router = express.Router()

router.post("/create-class/", (req: Request, res: Response) => {
    if(!req.session.isTeacher || !req.session.isStaff || !req.session.isSuperuser){
        
    }
})
export default router