import express from "express";
import {userAuth} from "../middleware/uesrAuth.js";
import {createPost} from "../controller/postController.js";
import { getAllPosts } from "../controller/postController.js";


const router=express.Router();

router.post("/create",userAuth,createPost);
router.get("/all", userAuth, getAllPosts);


export default router;