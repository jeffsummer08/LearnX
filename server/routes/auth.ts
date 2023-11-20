import express, {Request, Response} from "express"
import db from "../database/database"
import {User, NewUser, UpdateUser} from "../database/models/user"

const router = express.Router();
const crypto = require("crypto");

router.post("/login", (req: Request, res: Response) => {
    let query = db.selectFrom('users').where('name', '=', 'testUser')
    query.selectAll().execute().then(output => {
        res.json({
            data: output
        })
    });
    
})

router.post("/signup", (req: Request, res: Response) => {
    console.log(req.body);
    let salt:Buffer = crypto.randomBytes(16);
    //iterations set to 15000
    //can increase up to ~200k for better security
    //can decrease to be faster if server is dying
    crypto.pbkdf2(req.body["password"], salt, 15000, 64, "sha512", (err: Error, derivedKey: Buffer) => {
        if(err != null){
            console.log("Error hashing password");
            console.log(err.message);
            res.json({
                error: "Unable to create new user at this time"
            })
        }
        else{
            console.log(derivedKey.toString("hex"));
            console.log(salt.toString("hex"));
            res.json({
                error:""
            })
        }
    })
    
})

router.get("/test", (req: Request, res: Response) => {
    res.json({
        testing: "testing"
    })
})

export default router;