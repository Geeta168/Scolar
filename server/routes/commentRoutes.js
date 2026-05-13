import express from "express";
import {
  getPostComments,
  createComment,
  deleteComment,
  createReply,
  deleteReply
} from "../controller/commentController.js";
import { userAuth } from "../middleware/uesrAuth.js";

const router = express.Router();

// Get all comments for a post
router.get("/:postId", getPostComments);

// Create a new comment
router.post("/:postId", userAuth, createComment);

// Delete a comment
router.delete("/:commentId", userAuth, deleteComment);

// Create a reply to a comment
router.post("/:commentId/reply", userAuth, createReply);

// Delete a reply
router.delete("/reply/:replyId", userAuth, deleteReply);

export default router;
