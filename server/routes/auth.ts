import express, {Request, Response} from "express"
import db from "../database/database"
import {User, NewUser, UpdateUser} from "../database/models/user"
import { InsertResult } from "kysely";
import crypto from "crypto";
import util from "util";

const router = express.Router();
const pbkdf2 = util.promisify(crypto.pbkdf2);

router.post("/login", async (req: Request, res: Response) => {
    
})

router.post("/signup", async (req: Request, res: Response) => {
    console.log(req.body);
    try{
        const salt:Buffer = crypto.randomBytes(16);
        //iterations set to 15000
        //can increase up to ~200k for better security
        //can decrease to be faster if server is dying
        const passwordHash = await pbkdf2(req.body["password"], salt, 15000, 64, "sha512");
            
        const val = await db.insertInto('users').values(<NewUser> {
            name: req.body['username'],
            email: req.body['email'],
            passwordHash: passwordHash.toString('hex'),
            salt: salt.toString('hex')
        }).executeTakeFirst()
        
        res.sendStatus(200);
        console.log(val)
    }
    catch(err){
        res.status(500).send("Unable to create new user at this time");
        console.log(err);
    };
})

router.get("/test", (req: Request, res: Response) => {
    res.json({
        testing: "testing"
    })
})

export default router;