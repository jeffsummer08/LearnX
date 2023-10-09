import express, {Request, Response} from "express"
import db from "../database/database"
import {Student, UpdateStudent, NewStudent} from "../database/models/user"

const router = express.Router();

router.post("/login", (req: Request, res: Response) => {
    let query = db.selectFrom('student').where('name', '=', 'testUser')
    query.selectAll().execute().then(output => {
        res.json({
            data: output
        })
    });
    
})

router.post("/signup", (req: Request, res: Response) => {
    
})

export default router;