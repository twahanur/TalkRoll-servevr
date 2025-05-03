import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectToDatabase from "./config/database.connection.js";
import authRouter from "./routes/auth.routes.js";
import profileRouter from "./routes/profile.routes.js";
import connnectionRouter from "./routes/connection.routes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//Routes\
app.get("/", (req, res) => {
  res.send("Welcome to TalkRoll API");
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/connection", connnectionRouter);

//Starting the server and connecting to DB
connectToDatabase();
app.listen(PORT, () => console.log(`Server is running at port: ${PORT}`));
