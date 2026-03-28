import {register,login,logout} from "../controller/authController.js";
import express from "express";
import { userAuth } from "../middleware/uesrAuth.js";   

const Authrouter=express.Router();

Authrouter.post("/register",register);
Authrouter.post("/login",login);
Authrouter.post("/logout",userAuth,logout);

export default Authrouter;