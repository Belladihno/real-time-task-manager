import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env['PORT'] || 8000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.get("/", (_, res) => {
    res.send("Hello from task management server");
});
app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map