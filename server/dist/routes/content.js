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
const app_1 = require("firebase-admin/app");
const storage_1 = require("firebase-admin/storage");
const mime_types_1 = __importDefault(require("mime-types"));
const isomorphic_dompurify_1 = __importDefault(require("isomorphic-dompurify"));
(0, app_1.initializeApp)({
    credential: (0, app_1.cert)(require("../learnx-bpa-firebase-adminsdk-x81ds-5497ab747b.json")),
    storageBucket: "learnx-bpa.appspot.com"
});
const bucket = (0, storage_1.getStorage)().bucket();
const router = express_1.default.Router();
router.get("/course-list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = yield (yield database_1.default.selectFrom("courses").selectAll().execute()).sort((a, b) => a.id - b.id);
    res.json(query.filter(val => val.isPublished || req.session.isStaff || req.session.isSuperuser).map(val => ({
        title: val.title,
        url: val.url,
        thumbnail: val.thumbnail,
        description: val.description,
        isPublished: val.isPublished,
    })));
}));
router.get("/course/:course_url", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courseQuery = (yield database_1.default.selectFrom("courses").selectAll().where("url", "=", req.params.course_url).execute());
    let progressQuery = [];
    if (req.session.isAuthenticated) {
        progressQuery = (yield database_1.default.selectFrom("progress").selectAll().where("userId", "=", req.session.userId).where("courseId", "=", courseQuery[0].id).execute()).sort((a, b) => b.timestampCreated.getTime() - a.timestampCreated.getTime());
    }
    if (courseQuery.length === 0 || !courseQuery[0].isPublished && !req.session.isStaff && !req.session.isSuperuser) {
        res.status(401).json({
            msg: "Invalid course url"
        });
    }
    else {
        let unitsQuery;
        if (courseQuery[0].units.length > 0) {
            unitsQuery = (yield database_1.default.selectFrom("units").selectAll().where("id", "in", courseQuery[0].units).execute()).sort((a, b) => a.id - b.id);
        }
        else {
            unitsQuery = [];
        }
        res.status(200).json({
            title: courseQuery[0].title,
            thumbnail: courseQuery[0].thumbnail,
            description: courseQuery[0].description,
            isPublished: courseQuery[0].isPublished,
            units: yield Promise.all(unitsQuery.filter(val => val.isPublished || req.session.isStaff || req.session.isSuperuser).map((val) => __awaiter(void 0, void 0, void 0, function* () {
                let lessonsQuery = [];
                if (val.lessons.length > 0)
                    lessonsQuery = (yield database_1.default.selectFrom("lessons").selectAll().where("id", "in", val.lessons).execute()).sort((a, b) => a.id - b.id);
                console.log(lessonsQuery + " " + val.title);
                return {
                    title: val.title,
                    url: val.url,
                    isPublished: val.isPublished,
                    lessons: lessonsQuery.filter(val => val.isPublished || req.session.isStaff || req.session.isSuperuser).map(val => {
                        let progressValue = -1;
                        if (val.type === "quiz") {
                            for (const row of progressQuery) {
                                if (row.lessonId === val.id) {
                                    progressValue = row.progress;
                                    break;
                                }
                            }
                        }
                        return {
                            title: val.title,
                            type: val.type,
                            url: val.url,
                            progress: progressValue,
                            isPublished: val.isPublished
                        };
                    })
                };
            })))
        });
    }
}));
router.get("/lesson/:course_url/:unit_url/:lesson_url", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseQuery = yield database_1.default.selectFrom("courses").select("units").where("url", "=", req.params.course_url).execute();
        let unitQuery = [];
        if (courseQuery[0].units.length > 0)
            unitQuery = yield database_1.default.selectFrom("units").select("lessons").where("id", "in", courseQuery[0].units).where("url", "=", req.params.unit_url).execute();
        let lessonQuery = [];
        if (courseQuery[0].units.length > 0 && unitQuery[0].lessons.length > 0)
            lessonQuery = yield database_1.default.selectFrom("lessons").selectAll().where("id", "in", unitQuery[0].lessons).where("url", "=", req.params.lesson_url).execute();
        if (lessonQuery.length === 0 || !lessonQuery[0].isPublished && !req.session.isStaff && !req.session.isSuperuser) {
            res.status(401).json({
                msg: "Invalid course, unit, or lesson url/alias"
            });
        }
        else {
            let data = {
                title: lessonQuery[0].title,
                type: lessonQuery[0].type,
                isPublished: lessonQuery[0].isPublished,
                progress: -1
            };
            if (data.type === "article") {
                data.markdown = isomorphic_dompurify_1.default.sanitize(lessonQuery[0].content.markdown);
            }
            else if (data.type === "video") {
                data.videoUrl = lessonQuery[0].content.videoUrl;
            }
            else {
                let progressValue = -1;
                if (req.session.isAuthenticated) {
                    const progressQuery = (yield database_1.default.selectFrom("progress").select(["progress", "timestampCreated"]).where("userId", "=", req.session.userId).where("lessonId", "=", lessonQuery[0].id).execute()).sort((a, b) => b.timestampCreated.getTime() - a.timestampCreated.getTime());
                    if (progressQuery.length > 0) {
                        progressValue = progressQuery[0].progress;
                    }
                }
                data.progress = progressValue;
                data.questions = lessonQuery[0].content.questions;
            }
            res.json(data);
        }
    }
    catch (_a) {
        res.status(500).json({
            msg: "Unable to get lesson"
        });
    }
}));
router.post("/file-upload", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.isStaff && !req.session.isSuperuser) {
        res.sendStatus(403);
    }
    else {
        const fileData = req.body.fileData.replace(/^data:image\/\w+;base64,/, "");
        const fileName = req.body.fileName;
        bucket.file(fileName).save(Buffer.from(fileData, "base64"), {
            public: true,
            validation: "md5",
            metadata: {
                contentType: mime_types_1.default.lookup(fileName)
            }
        }).then(() => __awaiter(void 0, void 0, void 0, function* () {
            res.status(201).json({
                msg: "Successfully uploaded file",
                url: yield (0, storage_1.getDownloadURL)(bucket.file(fileName))
            });
        })).catch(error => {
            console.log(error);
            res.status(500).json({
                msg: "Unable to upload file. Try again in a few moments."
            });
        });
    }
}));
router.post("/delete-file", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
}));
router.post("/create-course", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.isStaff && !req.session.isSuperuser) {
        res.sendStatus(403);
    }
    else if (!req.body.url.match(/^[0-9a-z-]+$/)) {
        res.status(401).json({
            msg: "Invalid url/alias"
        });
    }
    else {
        try {
            const courseUrlCheck = yield database_1.default.selectFrom("courses").selectAll().where("url", "=", req.body.url).execute();
            if (courseUrlCheck.length > 0) {
                res.status(401).json({
                    msg: "Course url is taken"
                });
            }
            else {
                yield database_1.default.insertInto("courses").values({
                    title: req.body.title,
                    url: req.body.url,
                    thumbnail: req.body.thumbnail,
                    description: req.body.description,
                }).execute();
                res.status(201).json({
                    msg: "Successfully created course"
                });
            }
        }
        catch (_b) {
            res.status(500).json({
                msg: "Unable to create course"
            });
        }
    }
}));
router.post("/edit-course", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.isStaff && !req.session.isSuperuser) {
        res.sendStatus(403);
    }
    else {
        try {
            const courseQuery = yield database_1.default.selectFrom("courses").selectAll().where("url", "=", req.body.url).execute();
            if (courseQuery.length !== 1) {
                res.status(401).json({
                    msg: "Invalid course url"
                });
            }
            else if (!req.body.update_url.match(/^[0-9a-z-]+$/)) {
                res.status(401).json({
                    msg: "Invalid update url/alias. Use url to denote the current course url and update_url to denote the new url."
                });
            }
            else {
                const courseUrlCheck = yield database_1.default.selectFrom("courses").selectAll().where("url", "=", req.body.update_url).execute();
                if (req.body.update_url != req.body.url && courseUrlCheck.length > 0) {
                    res.status(401).json({
                        msg: "Update url is taken"
                    });
                }
                else {
                    yield database_1.default.updateTable("courses").where("url", "=", req.body.url).set({
                        title: req.body.title,
                        url: req.body.update_url,
                        thumbnail: req.body.thumbnail,
                        description: req.body.description,
                        isPublished: req.body.isPublished
                    }).execute();
                    res.status(200).json({
                        msg: "Sucessfully edited course"
                    });
                }
            }
        }
        catch (_c) {
            res.status(500).json({
                msg: "Unable to edit course"
            });
        }
    }
}));
router.post("/delete-course", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.isStaff && !req.session.isSuperuser) {
        res.sendStatus(403);
    }
    else {
        try {
            const courseQuery = yield database_1.default.selectFrom("courses").selectAll().where("url", "=", req.body.url).execute();
            if (courseQuery.length !== 1) {
                res.status(401).json({
                    msg: "Invalid course url"
                });
            }
            else {
                yield database_1.default.deleteFrom("courses").where("url", "=", req.body.url).execute();
                res.status(200).json({
                    msg: "Sucessfully deleted course"
                });
            }
        }
        catch (_d) {
            res.status(500).json({
                msg: "Unable to delete course"
            });
        }
    }
}));
router.post("/create-unit", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.isStaff && !req.session.isSuperuser) {
        res.sendStatus(403);
    }
    else if (!req.body.url.match(/^[0-9a-z-]+$/)) {
        res.status(401).json({
            msg: "Invalid url/alias"
        });
    }
    else {
        try {
            const courseExistQuery = yield database_1.default.selectFrom("courses").selectAll().where("url", "=", req.body.course_url).execute();
            if (courseExistQuery.length !== 1) {
                res.status(401).json({
                    msg: "Invalid course url/alias"
                });
            }
            else {
                let unitExistQuery = [];
                if (courseExistQuery[0].units.length > 0)
                    unitExistQuery = yield database_1.default.selectFrom("units").selectAll().where("id", "in", courseExistQuery[0].units).where("url", "=", req.body.url).execute();
                if (unitExistQuery.length !== 0) {
                    res.status(401).json({
                        msg: "Unit url is taken"
                    });
                }
                else {
                    const newUnitId = yield database_1.default.insertInto("units").values({
                        title: req.body.title,
                        url: req.body.url,
                    }).returning("id").execute();
                    yield database_1.default.updateTable("courses").where("courses.url", "=", req.body.course_url).set((eb) => ({
                        units: eb("units", "||", `{${newUnitId[0].id}}`)
                    })).execute();
                    res.status(201).json({
                        msg: "Successfully created unit"
                    });
                }
            }
        }
        catch (_e) {
            res.status(500).json({
                msg: "Unable to create unit"
            });
        }
    }
}));
router.post("/edit-unit", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.isStaff && !req.session.isSuperuser) {
        res.sendStatus(403);
    }
    else if (!req.body.update_url.match(/^[0-9a-z-]+$/)) {
        res.status(401).json({
            msg: "Invalid update url/alias. Use url to denote the current unit url and update_url to denote the new url."
        });
    }
    else {
        try {
            const courseExistQuery = yield database_1.default.selectFrom("courses").selectAll().where("url", "=", req.body.course_url).execute();
            if (courseExistQuery.length !== 1) {
                res.status(401).json({
                    msg: "Invalid course url/alias, course_url"
                });
            }
            else {
                let unitExistQuery = [];
                let updateUnitExistQuery = [];
                if (courseExistQuery[0].units.length > 0) {
                    unitExistQuery = yield database_1.default.selectFrom("units").selectAll().where("id", "in", courseExistQuery[0].units).where("url", "=", req.body.url).execute();
                    updateUnitExistQuery = yield database_1.default.selectFrom("units").selectAll().where("id", "in", courseExistQuery[0].units).where("url", "=", req.body.update_url).execute();
                }
                console.log(unitExistQuery);
                if (unitExistQuery.length !== 1) {
                    res.status(401).json({
                        msg: "Unit does not exist"
                    });
                }
                else if (req.body.update_url != req.body.url && updateUnitExistQuery.length > 0) {
                    res.status(401).json({
                        msg: "Update url is taken"
                    });
                }
                else {
                    yield database_1.default.updateTable("units").where("id", "in", courseExistQuery[0].units).where("url", "=", req.body.url).set({
                        title: req.body.title,
                        url: req.body.update_url,
                        isPublished: req.body.isPublished
                    }).execute();
                    res.status(200).json({
                        msg: "Successfully edited unit"
                    });
                }
            }
        }
        catch (_f) {
            res.status(500).json({
                msg: "Unable to edit unit"
            });
        }
    }
}));
router.post("/delete-unit", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.isStaff && !req.session.isSuperuser) {
        res.sendStatus(403);
    }
    else {
        try {
            const courseQuery = yield database_1.default.selectFrom("courses").selectAll().where("url", "=", req.body.course_url).execute();
            if (courseQuery.length !== 1) {
                res.status(401).json({
                    msg: "Invalid course url, use course_url"
                });
            }
            else {
                const deleteQuery = yield database_1.default.deleteFrom("units").where("id", "in", courseQuery[0].units).where("url", "=", req.body.url).execute();
                if (deleteQuery.length === 0) {
                    res.status(401).json("Could not find unit to delete");
                }
                else {
                    res.json({
                        msg: "Successfully deleted lesson"
                    });
                }
            }
        }
        catch (_g) {
            res.status(500).json({
                msg: "Successfully deleted unit"
            });
        }
    }
}));
router.post("/create-lesson", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.isStaff && !req.session.isSuperuser) {
        res.sendStatus(403);
    }
    else if (!req.body.url.match(/^[0-9a-z-]+$/)) {
        res.status(401).json({
            msg: "Invalid url/alias"
        });
    }
    else {
        try {
            const courseExistQuery = yield database_1.default.selectFrom("courses").selectAll().where("url", "=", req.body.course_url).execute();
            if (courseExistQuery.length !== 1) {
                res.status(401).json({
                    msg: "Invalid course url/alias, use course_url"
                });
            }
            else {
                let unitExistQuery = [];
                if (courseExistQuery[0].units.length > 0)
                    unitExistQuery = yield database_1.default.selectFrom("units").selectAll().where("id", "in", courseExistQuery[0].units).where("url", "=", req.body.unit_url).execute();
                let lessonExistQuery = [];
                if (unitExistQuery[0].lessons.length > 0)
                    lessonExistQuery = yield database_1.default.selectFrom("lessons").select("id").where("id", "in", unitExistQuery[0].lessons).where("url", "=", req.body.url).execute();
                if (unitExistQuery.length !== 1) {
                    res.status(401).json({
                        msg: "Invalid unit url/alias, use unit_url"
                    });
                }
                else if (lessonExistQuery.length > 0) {
                    res.status(401).json({
                        msg: "Lesson url is taken"
                    });
                }
                else {
                    let works = true;
                    let lessonValues = {
                        title: req.body.title,
                        url: req.body.url,
                        type: req.body.type
                    };
                    if (lessonValues.type === "article") {
                        lessonValues.content = {
                            markdown: req.body.markdown ? isomorphic_dompurify_1.default.sanitize(req.body.markdown) : ""
                        };
                    }
                    else if (lessonValues.type === "quiz") {
                        lessonValues.content = {
                            questions: req.body.questions ? req.body.questions : ""
                        };
                    }
                    else if (lessonValues.type === "video" && req.body.video_url) {
                        lessonValues.content = {
                            videoUrl: req.body.video_url
                        };
                    }
                    else {
                        res.status(401).json({
                            msg: "Make sure type article lessons pass in a markdown field, type quiz lessons pass in a questions field, and type video lessons pass in a video_url field"
                        });
                        works = false;
                    }
                    if (works) {
                        const newLessonId = yield database_1.default.insertInto("lessons").values(lessonValues).returning("id").execute();
                        yield database_1.default.updateTable("units").where("id", "in", courseExistQuery[0].units).where("url", "=", req.body.unit_url).set((eb) => ({
                            lessons: eb("lessons", "||", `{${newLessonId[0].id}}`)
                        })).execute();
                        res.status(201).json({
                            msg: "Successfully created lesson"
                        });
                    }
                }
            }
        }
        catch (_h) {
            res.status(500).json({
                msg: "Unable to create lesson"
            });
        }
    }
}));
router.post("/edit-lesson", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.isStaff && !req.session.isSuperuser) {
        res.sendStatus(403);
    }
    else if (!req.body.update_url.match(/^[0-9a-z-]+$/)) {
        res.status(401).json({
            msg: "Invalid update url/alias. Use url to denote the current unit url and update_url to denote the new url."
        });
    }
    else if (!req.body.course_url || !req.body.unit_url || !req.body.url || !req.body.update_url) {
        res.status(401).json({
            msg: "Use course_url, unit_url, url, and update_url parameters"
        });
    }
    else {
        try {
            const courseQuery = yield database_1.default.selectFrom("courses").select("units").where("url", "=", req.body.course_url).execute();
            let unitQuery = [];
            if (courseQuery[0].units.length > 0)
                unitQuery = yield database_1.default.selectFrom("units").select("lessons").where("id", "in", courseQuery[0].units).where("url", "=", req.body.unit_url).execute();
            let updateLessonExistQuery = [];
            if (unitQuery[0].lessons.length > 0)
                updateLessonExistQuery = yield database_1.default.selectFrom("lessons").select("id").where("id", "in", unitQuery[0].lessons).where("url", "=", req.body.update_url).execute();
            let updateQuery = [];
            let works = true;
            if (req.body.update_url != req.body.url && updateLessonExistQuery.length > 0) {
                res.status(401).json({
                    msg: "Update url is taken"
                });
                works = false;
            }
            else if (courseQuery[0].units.length > 0 && unitQuery[0].lessons.length > 0) {
                let lessonValues = {
                    title: req.body.title,
                    url: req.body.update_url,
                    type: req.body.type,
                    isPublished: req.body.isPublished
                };
                if (lessonValues.type === "article") {
                    lessonValues.content = {
                        markdown: req.body.markdown ? isomorphic_dompurify_1.default.sanitize(req.body.markdown) : ""
                    };
                }
                else if (lessonValues.type === "quiz") {
                    lessonValues.content = {
                        questions: req.body.questions ? req.body.questions : ""
                    };
                }
                else if (lessonValues.type === "video" && req.body.video_url) {
                    lessonValues.content = {
                        videoUrl: req.body.video_url
                    };
                }
                else {
                    res.status(401).json({
                        msg: "Make sure type article lessons pass in a markdown field, type quiz lessons pass in a questions field, and type video lessons pass in a video_url field"
                    });
                    works = false;
                }
                if (works) {
                    updateQuery = yield database_1.default.updateTable("lessons").where("id", "in", unitQuery[0].lessons).where("url", "=", req.body.url).set(lessonValues).execute();
                }
            }
            if (works && updateQuery.length === 0) {
                res.status(401).json("Could not find lesson to update");
            }
            else if (works) {
                res.json({
                    msg: "Successfully updated lesson"
                });
            }
        }
        catch (_j) {
            res.status(500).json({
                msg: "Unable to update lesson"
            });
        }
    }
}));
router.post("/delete-lesson", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.isStaff && !req.session.isSuperuser) {
        res.sendStatus(403);
    }
    else if (!req.body.course_url || !req.body.unit_url || !req.body.url) {
        res.status(401).json({
            msg: "Use course_url, unit_url, and url parameters"
        });
    }
    else {
        try {
            const courseQuery = yield database_1.default.selectFrom("courses").select("units").where("url", "=", req.body.course_url).execute();
            let unitQuery = [];
            if (courseQuery[0].units.length > 0)
                unitQuery = yield database_1.default.selectFrom("units").select("lessons").where("id", "in", courseQuery[0].units).where("url", "=", req.body.unit_url).execute();
            let deleteQuery = [];
            if (courseQuery[0].units.length > 0 && unitQuery[0].lessons.length > 0)
                deleteQuery = yield database_1.default.deleteFrom("lessons").where("id", "in", unitQuery[0].lessons).where("url", "=", req.body.url).execute();
            if (deleteQuery.length === 0) {
                res.status(401).json("Could not find lesson to delete");
            }
            else {
                res.json({
                    msg: "Successfully deleted lesson"
                });
            }
        }
        catch (_k) {
            res.status(500).json({
                msg: "Unable to delete lesson"
            });
        }
    }
}));
router.post("/update-lesson-progress", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let progressValue = parseInt(req.body.progress);
    if (!req.session.isAuthenticated) {
        res.status(401).json({
            msg: "Cannot save score as you are not logged in!"
        });
    }
    else if (isNaN(req.body.progress) || progressValue < 0 || progressValue > 100) {
        res.status(401).json({
            msg: "Invalid progress"
        });
    }
    else {
        try {
            const courseQuery = yield database_1.default.selectFrom("courses").select(["id", "units"]).where("url", "=", req.body.course_url).execute();
            let unitQuery = [];
            if (courseQuery[0].units.length > 0)
                unitQuery = yield database_1.default.selectFrom("units").select(["id", "lessons"]).where("id", "in", courseQuery[0].units).where("url", "=", req.body.unit_url).execute();
            let lessonQuery = [];
            if (courseQuery[0].units.length > 0 && unitQuery[0].lessons.length > 0)
                lessonQuery = yield database_1.default.selectFrom("lessons").select("id").where("id", "in", unitQuery[0].lessons).where("url", "=", req.body.url).execute();
            if (lessonQuery.length > 0) {
                yield database_1.default.insertInto("progress").values({
                    userId: req.session.userId,
                    lessonId: lessonQuery[0].id,
                    unitId: unitQuery[0].id,
                    courseId: courseQuery[0].id,
                    progress: progressValue
                }).execute();
                res.status(201).json({
                    msg: "Sucessfully updated lesson progress"
                });
            }
        }
        catch (_l) {
            res.status(500).json({
                msg: "Unable to update lesson progress"
            });
        }
    }
}));
exports.default = router;
