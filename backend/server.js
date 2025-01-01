import express from "express"

import authRouter from "./routes/auth.routes.js"

import { connectDB } from "./config/db.js";
import dotenv  from "dotenv"

const app = express();


dotenv.config()

const PORT = process.env.PORT || 8000
app.get("/", (req, res) => {
    res.send("Server uploaded successfully")
})

app.use("/api/auth", authRouter)

app.use(express.json());

app.listen(PORT,()=> {
    connectDB()
    console.log(`server started at ${PORT}`)
})