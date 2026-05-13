import express from "express";
import { userAuth } from "../middleware/uesrAuth.js";
import { 
  getAllDiscussions, 
  createDiscussion, 
  getDiscussionComments, 
  createDiscussionComment 
} from "../controller/discussionController.js";

const discussionRouter = express.Router();

discussionRouter.get("/all", getAllDiscussions);
discussionRouter.post("/create", userAuth, createDiscussion);
discussionRouter.get("/comments/:discussionId", getDiscussionComments);
discussionRouter.post("/comments/:discussionId/create", userAuth, createDiscussionComment);

export default discussionRouter;
