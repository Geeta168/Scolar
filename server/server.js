import express from "express";
import cors from "cors";
import authrouter from "./routes/authRoutes.js"; 
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();


const app=express();
app.use(cookieParser());
app.use(express.json());
const port=3000;

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

app.use('/api/auth',authrouter);


app.listen(port,console.log("server is running at port 3000"));