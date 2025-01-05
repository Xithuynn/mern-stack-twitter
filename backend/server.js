import express from "express"

import authRouter from "./routes/auth.routes.js"

import { connectDB } from "./config/db.js";
import dotenv  from "dotenv"
import cookieParser from "cookie-parser";

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
dotenv.config()

const PORT = process.env.PORT || 8000
app.get("/", (req, res) => {
    res.send("Server uploaded successfully")
})

app.use("/api/auth", authRouter)


app.listen(PORT,()=> {
    connectDB()
    console.log(`server started at ${PORT}`)
})