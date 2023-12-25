import express, {Request, Response} from "express"
import db from "../database/database"
import {User, NewUser, UpdateUser} from "../database/models/user"
import { InsertResult } from "kysely"
import crypto from "crypto"
import util from "util"
import session from "express-session"

const router = express.Router()
const pbkdf2 = util.promisify(crypto.pbkdf2)

//iterations set to 15000
//can increase up to ~200k for better security
//can decrease to be faster if server is dying
async function hashPassword(passwordRaw: string, salt: string){
    return (await pbkdf2(passwordRaw, salt, 15000, 64, "sha512")).toString("hex")
}
router.post("/login", async (req: Request, res: Response) => {
    try{
        const emailInput = req.body["email"]
        const passwordInput = req.body["password"]
        console.log(emailInput + " " + passwordInput);
        const query = await db.selectFrom("users").select(["salt", "passwordHash", "isValid", "isTeacher", "isStaff", "isSuperuser"]).where("email", "=", emailInput).execute();
        let authenticated = false;
        if(query.length === 1){
            const salt = query[0]["salt"]
            const passwordHash = query[0]["passwordHash"]
            const isValid = query[0]["isValid"]
            const attemptedHash = await hashPassword(passwordInput, salt)
            console.log("Found email in db " + salt + " " + passwordHash)
            console.log(attemptedHash)
            if(attemptedHash === passwordHash){
                authenticated = true;
                //authenticate user
                //express session
                if(isValid){
                    req.session.isAuthenticated = true
                    req.session.isStaff = !!query[0]["isStaff"]
                    req.session.isTeacher = !!query[0]["isTeacher"]
                    req.session.isSuperuser = !!query[0]["isSuperuser"]

                    res.status(200).json({
                        error: false,
                        msg: "Successfully authenticated user"
                    })
                    console.log("Successfully authenticated user")
                }
                else{
                    res.status(403).json({
                        error: true,
                        msg: "That account has been deactivated"
                    })
                    console.log("Invalidated user attempted authorization")
                }
                
            }
        }
        if(!authenticated){
            res.status(401).json({
                error: true,
                msg: "Email and password combination does not exist"
            })
            console.log("Failed authentication attempt")            
        }
    }
    catch(err){
        res.status(500).json({
            error: true,
            msg: "Unable to authenticate users at this time"
        })
        console.log(err)
    }
})

router.post("/signup", async (req: Request, res: Response) => {
    //unique email check
    try{
        const emailCheck = await db.selectFrom("users").select("id").where("email", "=", req.body["email"]).execute();
        if(emailCheck.length >= 1){
            res.status(200).json({
                error: true,
                msg: "Email is already in use"
            })
        }
        else{
            const salt = crypto.randomBytes(16).toString("hex")
            const passwordHash = await hashPassword(req.body["password"], salt)
                
            const val = await db.insertInto('users').values(<NewUser> {
                firstname: req.body['firstname'],
                lastname: req.body['lastname'],
                email: req.body['email'],
                passwordHash: passwordHash,
                salt: salt
            }).executeTakeFirst()
            res.status(201).json({
                error: false,
                msg: "Successfully created new user!"
            })
            req.session.isAuthenticated = true
            req.session.isStaff = false
            req.session.isTeacher = false
            req.session.isSuperuser = false
            console.log("Successfully created new user!")
            console.log(val)
        }
    }
    catch(err){
        res.status(500).json({
            error: true,
            msg: "Unable to create new user at this time"
        })
        console.log(err);
    }
})

router.get("/logout", async (req: Request, res: Response) => {
    req.session.destroy((err: any) => {
        if(err){
            res.status(500).json({
                error: true,
                msg: "Unable to logout users at this time"
            })
            console.log(err);
        }
        else{
            res.redirect("/")
        }
    });
})

router.get("/test", (req: Request, res: Response) => {
    res.json({
        testing: "testing"
    })
})

export default router