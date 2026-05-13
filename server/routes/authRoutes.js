import {register,login,logout,getUser} from "../controller/authController.js";
import express from "express";
import { userAuth } from "../middleware/uesrAuth.js";   

const Authrouter=express.Router();

Authrouter.post("/register",register);
Authrouter.post("/login",login);
Authrouter.post("/logout",logout);
Authrouter.get("/user", userAuth, getUser);

export default Authrouter;