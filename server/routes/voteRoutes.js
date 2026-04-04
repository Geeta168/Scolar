import express from "express";
import pool from "../db.js";
import { userAuth } from "../middleware/uesrAuth.js";

const router = express.Router();

// 👍 UPVOTE
router.post("/:postId", userAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;

    await pool.query(
      "INSERT INTO votes (user_id, post_id) VALUES (?, ?)",
      [userId, postId]
    );

    res.json({ success: true });

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.json({ success: false, message: "Already voted" });
    }

    console.log(err);
    res.status(500).json({ success: false });
  }
});

export default router;