import express from "express"

import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import postRouter from "./routes/post.routes.js"

import { connectDB } from "./config/db.js";
import dotenv  from "dotenv"
import cookieParser from "cookie-parser";
import { v2 as cloudinary} from "cloudinary"


dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

const PORT = process.env.PORT || 8000
app.get("/", (req, res) => {
    res.send("Server uploaded successfully")
})

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/post", postRouter)


app.listen(PORT,()=> {
    connectDB()
    console.log(`server started at ${PORT}`)
})