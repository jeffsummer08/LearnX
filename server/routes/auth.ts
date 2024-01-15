import express, { Request, Response } from "express"
import db from "../database/database"
import { User, NewUser, UpdateUser } from "../database/models/user"
import { InsertResult } from "kysely"
import crypto from "crypto"
import util from "util"
import { QueryExecutorBase } from "kysely/dist/cjs/query-executor/query-executor-base"

const router = express.Router()
const pbkdf2 = util.promisify(crypto.pbkdf2)

//iterations set to 15000
//can increase up to ~200k for better security
//can decrease to be faster if server is dying
async function hashPassword(passwordRaw: string, salt: string) {
    return (await pbkdf2(passwordRaw, salt, 15000, 64, "sha512")).toString("hex")
}
router.post("/login", async (req: Request, res: Response) => {
    try {
        const emailInput = req.body.email
        const passwordInput = req.body.password
        console.log(emailInput + " " + passwordInput);
        const query = await db.selectFrom("users").selectAll().where("email", "=", emailInput).execute();
        let authenticated = false;
        if (query.length === 1) {
            const salt = query[0]["salt"]
            const passwordHash = query[0]["passwordHash"]
            const isValid = query[0]["isValid"]
            const attemptedHash = await hashPassword(passwordInput, salt)
            console.log("Found email in db " + salt + " " + passwordHash)
            console.log(attemptedHash)
            if (attemptedHash === passwordHash) {
                authenticated = true;
                if (isValid) {
                    req.session.isAuthenticated = true
                    req.session.isStaff = !!query[0]["isStaff"]
                    req.session.isTeacher = !!query[0]["isTeacher"]
                    req.session.isSuperuser = !!query[0]["isSuperuser"]
                    req.session.firstName = query[0]["firstname"]
                    req.session.lastName = query[0]["lastname"]
                    req.session.userId = query[0]["id"]
                    req.session.classes = query[0]["classes"]

                    res.status(200).json({
                        msg: "Successfully authenticated user"
                    })
                    console.log("Successfully authenticated user")
                }
                else {
                    res.status(403).json({
                        msg: "That account has been deactivated"
                    })
                    console.log("Invalidated user attempted authorization")
                }

            }
        }
        if (!authenticated) {
            res.status(401).json({
                msg: "Email and password combination does not exist"
            })
            console.log("Failed authentication attempt")
        }
    }
    catch (err) {
        res.status(500).json({
            msg: "Unable to authenticate users at this time"
        })
        console.log(err)
    }
})

router.post("/signup", async (req: Request, res: Response) => {
    //unique email check
    try {
        const emailCheck = await db.selectFrom("users").select("id").where("email", "=", req.body.email).execute();
        if (emailCheck.length >= 1) {
            res.status(401).json({
                msg: "Email is already in use"
            })
        }
        else if(req.body.firstname.length > 64 || req.body.lastname.length > 64){
            res.status(401).json({
                msg: "First and last name cannot be greater than 64 characters"
            })
        }
        else {
            const salt = crypto.randomBytes(16).toString("hex")
            const passwordHash = await hashPassword(req.body.password, salt)

            const val = await db.insertInto("users").values(<NewUser>{
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                passwordHash: passwordHash,
                isTeacher: req.body.isTeacher ? true : false,
                salt: salt
            }).returningAll().executeTakeFirst()

            req.session.isAuthenticated = true
            req.session.isStaff = !!val!.isStaff
            req.session.isTeacher = !!val!.isTeacher
            req.session.isSuperuser = !!val!.isSuperuser
            req.session.firstName = val!.firstname
            req.session.lastName = val!.lastname
            req.session.userId = val!.id
            req.session.classes = val!.classes
            console.log("Successfully created new user!")
            console.log(val)
            res.status(201).json({
                msg: "Successfully created new user!"
            })
        }
    }
    catch (err) {
        res.status(500).json({
            msg: "Unable to create new user at this time"
        })
        console.log(err);
    }
})

router.get("/logout", async (req: Request, res: Response) => {
    req.session.destroy((err: any) => {
        if (err) {
            res.status(500).json({
                msg: "Unable to logout users at this time"
            })
            console.log(err);
        }
        else {
            res.status(200).json({
                msg: "Successfully logged out user"
            })
        }
    });
})

router.get("/user", (req: Request, res: Response) => {
    console.log(req.headers.cookie)
    if (req.session.isAuthenticated) {
        res.status(200).json({
            isAuthenticated: req.session.isAuthenticated,
            isTeacher: req.session.isTeacher,
            isStaff: req.session.isStaff,
            isSuperuser: req.session.isSuperuser,
            firstName: req.session.firstName,
            lastName: req.session.lastName
        })
    }
    else {
        res.status(200).json({
            isAuthenticated: false,
            isTeacher: false,
            isStaff: false,
            isSuperuser: false,
            firstName: "",
            lastName: ""
        })
    }
})

export default router