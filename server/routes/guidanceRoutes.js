import express from "express";
import { getGuidanceChat, sendGuidanceMessage } from "../controller/guidanceController.js";
import { getGlobalGuidanceChat, sendGlobalGuidanceMessage } from "../controller/globalGuidanceController.js";
import { userAuth } from "../middleware/uesrAuth.js";

const router = express.Router();

router.get("/global", userAuth, getGlobalGuidanceChat);
router.post("/global", userAuth, sendGlobalGuidanceMessage);

router.get("/:postId", userAuth, getGuidanceChat);
router.post("/:postId", userAuth, sendGuidanceMessage);

export default router;
