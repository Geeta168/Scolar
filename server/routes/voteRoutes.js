import express from "express";
import pool from "../db.js";
import { userAuth } from "../middleware/uesrAuth.js";

const router = express.Router();

// 👍 TOGGLE UPVOTE
router.post("/upvote", userAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ success: false, message: "postId required" });
    }

    const [existing] = await pool.query(
      "SELECT id FROM votes WHERE user_id = ? AND post_id = ? AND vote_type = 'upvote'",
      [userId, postId]
    );

    if (existing.length > 0) {
      await pool.query(
        "DELETE FROM votes WHERE user_id = ? AND post_id = ? AND vote_type = 'upvote'",
        [userId, postId]
      );
      return res.json({ success: true, action: "removed" });
    }

    // Remove any existing downvote for this post
    await pool.query(
      "DELETE FROM votes WHERE user_id = ? AND post_id = ? AND vote_type = 'downvote'",
      [userId, postId]
    );

    await pool.query(
      "INSERT INTO votes (user_id, post_id, vote_type) VALUES (?, ?, 'upvote')",
      [userId, postId]
    );

    res.json({ success: true, action: "added" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

// 👎 TOGGLE DOWNVOTE
router.post("/downvote", userAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ success: false, message: "postId required" });
    }

    const [existing] = await pool.query(
      "SELECT id FROM votes WHERE user_id = ? AND post_id = ? AND vote_type = 'downvote'",
      [userId, postId]
    );

    if (existing.length > 0) {
      await pool.query(
        "DELETE FROM votes WHERE user_id = ? AND post_id = ? AND vote_type = 'downvote'",
        [userId, postId]
      );
      return res.json({ success: true, action: "removed" });
    }

    // Remove any existing upvote for this post
    await pool.query(
      "DELETE FROM votes WHERE user_id = ? AND post_id = ? AND vote_type = 'upvote'",
      [userId, postId]
    );

    await pool.query(
      "INSERT INTO votes (user_id, post_id, vote_type) VALUES (?, ?, 'downvote')",
      [userId, postId]
    );

    res.json({ success: true, action: "added" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

export default router;