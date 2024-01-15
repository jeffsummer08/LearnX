"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../database/database"));
const kysely_1 = require("kysely");
const crypto_1 = __importDefault(require("crypto"));
const util_1 = __importDefault(require("util"));
const router = express_1.default.Router();
const pbkdf2 = util_1.default.promisify(crypto_1.default.pbkdf2);
//iterations set to 15000
//can increase up to ~200k for better security
//can decrease to be faster if server is dying
function hashPassword(passwordRaw, salt) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield pbkdf2(passwordRaw, salt, 15000, 64, "sha512")).toString("hex");
    });
}
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emailInput = req.body.email;
        const passwordInput = req.body.password;
        const query = yield database_1.default.selectFrom("users").selectAll().where("email", "=", emailInput).execute();
        let authenticated = false;
        if (query.length === 1) {
            const salt = query[0]["salt"];
            const passwordHash = query[0]["passwordHash"];
            const isValid = query[0]["isValid"];
            const attemptedHash = yield hashPassword(passwordInput, salt);
            if (attemptedHash === passwordHash) {
                authenticated = true;
                if (isValid) {
                    req.session.isAuthenticated = true;
                    req.session.isStaff = !!query[0]["isStaff"];
                    req.session.isTeacher = !!query[0]["isTeacher"];
                    req.session.isSuperuser = !!query[0]["isSuperuser"];
                    req.session.firstName = query[0]["firstname"];
                    req.session.lastName = query[0]["lastname"];
                    req.session.userId = query[0]["id"];
                    req.session.classes = query[0]["classes"];
                    res.status(200).json({
                        msg: "Successfully authenticated user"
                    });
                    console.log("Successfully authenticated user");
                }
                else {
                    res.status(403).json({
                        msg: "That account has been deactivated"
                    });
                    console.log("Invalidated user attempted authorization");
                }
            }
        }
        if (!authenticated) {
            res.status(401).json({
                msg: "Email and password combination does not exist"
            });
            console.log("Failed authentication attempt");
        }
    }
    catch (err) {
        res.status(500).json({
            msg: "Unable to authenticate users at this time"
        });
        console.log(err);
    }
}));
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //unique email check
    try {
        const emailCheck = yield database_1.default.selectFrom("users").select("id").where("email", "=", req.body.email).execute();
        if (emailCheck.length >= 1) {
            res.status(401).json({
                msg: "Email is already in use"
            });
        }
        else if (req.body.firstname.length > 64 || req.body.lastname.length > 64) {
            res.status(401).json({
                msg: "First and last name cannot be greater than 64 characters"
            });
        }
        else {
            const salt = crypto_1.default.randomBytes(16).toString("hex");
            const passwordHash = yield hashPassword(req.body.password, salt);
            const val = yield database_1.default.insertInto("users").values({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                passwordHash: passwordHash,
                isTeacher: req.body.isTeacher ? true : false,
                salt: salt
            }).returningAll().executeTakeFirst();
            req.session.isAuthenticated = true;
            req.session.isStaff = !!val.isStaff;
            req.session.isTeacher = !!val.isTeacher;
            req.session.isSuperuser = !!val.isSuperuser;
            req.session.firstName = val.firstname;
            req.session.lastName = val.lastname;
            req.session.userId = val.id;
            req.session.classes = val.classes;
            console.log("Successfully created new user!");
            console.log(val);
            res.status(201).json({
                msg: "Successfully created new user!"
            });
        }
    }
    catch (err) {
        res.status(500).json({
            msg: "Unable to create new user at this time"
        });
        console.log(err);
    }
}));
router.get("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({
                msg: "Unable to logout users at this time"
            });
            console.log(err);
        }
        else {
            res.status(200).json({
                msg: "Successfully logged out user"
            });
        }
    });
}));
router.post("/reset-password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const passwordInput = req.body.password;
        const query = yield database_1.default.selectFrom("users").selectAll().where("id", "=", req.session.userId).execute();
        let authenticated = false;
        if (query.length === 1) {
            const salt = query[0]["salt"];
            const passwordHash = query[0]["passwordHash"];
            const attemptedHash = yield hashPassword(passwordInput, salt);
            if (attemptedHash === passwordHash) {
                authenticated = true;
                const salt = crypto_1.default.randomBytes(16).toString("hex");
                const passwordHash = yield hashPassword(req.body.new_password, salt);
                yield database_1.default.updateTable("users").where("id", "=", query[0].id).set({
                    salt: salt,
                    passwordHash: passwordHash
                }).execute();
                yield (0, kysely_1.sql) `delete from sessions where sess ->> 'userId'='${kysely_1.sql.lit(req.session.userId)}'`.execute(database_1.default);
                res.json({
                    msg: "Succesfully reset password"
                });
            }
        }
        if (!authenticated) {
            res.status(401).json({
                msg: "Invalid original password"
            });
            console.log("Failed authentication attempt");
        }
    }
    catch (err) {
        res.status(500).json({
            msg: "Unable to reset passwords at this time"
        });
        console.log(err);
    }
}));
router.post("/deactivate-account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const passwordInput = req.body.password;
        const query = yield database_1.default.selectFrom("users").selectAll().where("id", "=", req.session.userId).execute();
        let authenticated = false;
        if (query.length === 1) {
            const salt = query[0]["salt"];
            const passwordHash = query[0]["passwordHash"];
            const attemptedHash = yield hashPassword(passwordInput, salt);
            if (attemptedHash === passwordHash) {
                authenticated = true;
                const salt = crypto_1.default.randomBytes(16).toString("hex");
                const passwordHash = yield hashPassword(req.body.password, salt);
                yield database_1.default.updateTable("users").where("id", "=", query[0].id).set({
                    isValid: false
                }).execute();
                yield (0, kysely_1.sql) `delete from sessions where sess ->> 'userId'='${kysely_1.sql.lit(req.session.userId)}'`.execute(database_1.default);
                res.json({
                    msg: "Succesfully deactivated account"
                });
            }
        }
        if (!authenticated) {
            res.status(401).json({
                msg: "Invalid original password"
            });
            console.log("Failed authentication attempt");
        }
    }
    catch (err) {
        res.status(500).json({
            msg: "Unable to deactivate accounts at this time"
        });
        console.log(err);
    }
}));
router.get("/user", (req, res) => {
    if (req.session.isAuthenticated) {
        res.status(200).json({
            isAuthenticated: req.session.isAuthenticated,
            isTeacher: req.session.isTeacher,
            isStaff: req.session.isStaff,
            isSuperuser: req.session.isSuperuser,
            firstName: req.session.firstName,
            lastName: req.session.lastName
        });
    }
    else {
        res.status(200).json({
            isAuthenticated: false,
            isTeacher: false,
            isStaff: false,
            isSuperuser: false,
            firstName: "",
            lastName: ""
        });
    }
});
exports.default = router;
