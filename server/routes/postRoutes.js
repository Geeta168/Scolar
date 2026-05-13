import express from "express";
import {userAuth} from "../middleware/uesrAuth.js";
import {createPost, getAllPosts, analyzePostScam} from "../controller/postController.js";


const router=express.Router();

router.post("/create",userAuth,createPost);
router.get("/all", userAuth, getAllPosts);
router.get("/analyze/:postId", analyzePostScam);


export default router;