"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const content_1 = __importDefault(require("./routes/content"));
const classes_1 = __importDefault(require("./routes/classes"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const pg_1 = require("pg");
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.static(path_1.default.join(__dirname, "./client")));
app.use(express_1.default.json());
app.use("/static", express_1.default.static(path_1.default.join(__dirname, "./client/assets")));
const dbPool = new pg_1.Pool({
    connectionString: process.env.DATABASE_STRING,
    max: 1
});
app.use((0, cors_1.default)({
    origin: true,
    optionsSuccessStatus: 200,
    credentials: true
}));
app.use(express_1.default.json());
const pgSession = (0, connect_pg_simple_1.default)(express_session_1.default);
app.use((0, express_session_1.default)({
    store: new pgSession({
        pool: dbPool,
        tableName: "sessions",
        createTableIfMissing: true,
    }),
    secret: process.env.COOKIE_SEED,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 3600 * 24 },
    resave: false,
    rolling: true
}));
app.use('/auth', auth_1.default);
app.use('/content', content_1.default);
app.use('/classes', classes_1.default);
app.get("*", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "./client", "index.html"));
});
app.listen(8080, () => {
    console.log("Server on http://localhost:8080");
});
