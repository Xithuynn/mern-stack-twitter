import express from "express"

import authRouter from "./routes/auth.routes.js"




const app = express();

app.get("/", (req, res) => {
    res.send("Server uploaded successfully")
})

app.use("/api/auth", authRouter)

app.listen(8000,()=> {
    console.log("server started at 8000")
})