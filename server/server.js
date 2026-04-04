import express from "express";
import cors from "cors";
import authrouter from "./routes/authRoutes.js";
import analyzeRouter from "./routes/analysisRoutes.js"; 
import cookieParser from "cookie-parser";
import postRouter from "./routes/postRoutes.js";
import voteRouter from "./routes/voteRoutes.js";

import dotenv from "dotenv";

dotenv.config();

console.log("API KEY:", process.env.GROQ_API_KEY);

const app=express();

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))


app.use(cookieParser());
app.use(express.json());
const port=3000;


app.use('/api/auth',authrouter);
app.use('/api',analyzeRouter);
app.use('/api/posts',postRouter);
app.use('/api/votes',voteRouter);



app.listen(port,console.log("server is running at port 3000"));