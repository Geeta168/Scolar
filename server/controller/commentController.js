import pool from "../db.js";

// Get all comments for a post with their replies
export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const [comments] = await pool.query(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.user_id,
        u.username,
        GROUP_CONCAT(
          JSON_OBJECT(
            'id', cr.id,
            'content', cr.content,
            'created_at', cr.created_at,
            'user_id', cr.user_id,
            'username', ru.username
          )
        ) AS replies
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      LEFT JOIN comment_replies cr ON c.id = cr.comment_id
      LEFT JOIN users ru ON cr.user_id = ru.user_id
      WHERE c.post_id = ?
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, [postId]);

    res.json({
      success: true,
      comments: comments.map(comment => ({
        ...comment,
        replies: comment.replies ? JSON.parse(`[${comment.replies}]`) : []
      }))
    });

  } catch (err) {
    console.log("GET COMMENTS ERROR:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Create a new comment
export const createComment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || !postId) {
      return res.status(400).json({ success: false, message: "Content and postId required" });
    }

    const [result] = await pool.query(
      "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
      [postId, userId, content]
    );

    res.json({
      success: true,
      commentId: result.insertId
    });

  } catch (err) {
    console.log("CREATE COMMENT ERROR:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { commentId } = req.params;
    const userId = req.user.userId;

    // Check if user owns the comment
    const [comment] = await pool.query(
      "SELECT user_id FROM comments WHERE id = ?",
      [commentId]
    );

    if (!comment.length || comment[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this comment" });
    }

    await pool.query("DELETE FROM comments WHERE id = ?", [commentId]);

    res.json({ success: true });

  } catch (err) {
    console.log("DELETE COMMENT ERROR:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Create a reply to a comment
export const createReply = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || !commentId) {
      return res.status(400).json({ success: false, message: "Content and commentId required" });
    }

    const [result] = await pool.query(
      "INSERT INTO comment_replies (comment_id, user_id, content) VALUES (?, ?, ?)",
      [commentId, userId, content]
    );

    res.json({
      success: true,
      replyId: result.insertId
    });

  } catch (err) {
    console.log("CREATE REPLY ERROR:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a reply
export const deleteReply = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { replyId } = req.params;
    const userId = req.user.userId;

    // Check if user owns the reply
    const [reply] = await pool.query(
      "SELECT user_id FROM comment_replies WHERE id = ?",
      [replyId]
    );

    if (!reply.length || reply[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this reply" });
    }

    await pool.query("DELETE FROM comment_replies WHERE id = ?", [replyId]);

    res.json({ success: true });

  } catch (err) {
    console.log("DELETE REPLY ERROR:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
