import pool from "../db.js";

// Helper to ensure tables exist (just in case)
const ensureTables = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public_discussions (
              discussion_id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              content TEXT NOT NULL,
              is_anonymous BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(user_id)
            );
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS discussion_comments (
              comment_id INT AUTO_INCREMENT PRIMARY KEY,
              discussion_id INT NOT NULL,
              user_id INT NOT NULL,
              content TEXT NOT NULL,
              is_anonymous BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (discussion_id) REFERENCES public_discussions(discussion_id) ON DELETE CASCADE,
              FOREIGN KEY (user_id) REFERENCES users(user_id)
            );
        `);
    } catch (err) {
        console.error("TABLE CREATION ERROR:", err.message);
    }
};

// Fetch all discussions
export const getAllDiscussions = async (req, res) => {
  try {
    await ensureTables();
    const [discussions] = await pool.query(`
      SELECT 
        d.discussion_id,
        d.content,
        d.is_anonymous,
        d.created_at,
        u.username
      FROM public_discussions d
      JOIN users u ON d.user_id = u.user_id
      ORDER BY d.created_at DESC
    `);

    // Mask usernames if anonymous
    const sanitizedDiscussions = discussions.map(disc => ({
      ...disc,
      username: disc.is_anonymous ? "Anonymous" : disc.username
    }));

    res.json({ success: true, discussions: sanitizedDiscussions });
  } catch (err) {
    console.error("GET DISCUSSIONS ERROR:", err);
    res.status(500).json({ success: false, error: "Server error fetching discussions", details: err.message });
  }
};

// Create a new discussion
export const createDiscussion = async (req, res) => {
  try {
    await ensureTables();
    const { content, isAnonymous } = req.body;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const [result] = await pool.query(
      "INSERT INTO public_discussions (user_id, content, is_anonymous) VALUES (?, ?, ?)",
      [userId, content, isAnonymous || false]
    );

    res.json({ success: true, discussionId: result.insertId });
  } catch (err) {
    console.error("CREATE DISCUSSION ERROR:", err);
    res.status(500).json({ success: false, error: "Server error creating discussion", details: err.message });
  }
};

// Fetch comments for a discussion
export const getDiscussionComments = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const [comments] = await pool.query(`
      SELECT 
        c.comment_id,
        c.content,
        c.is_anonymous,
        c.created_at,
        u.username
      FROM discussion_comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.discussion_id = ?
      ORDER BY c.created_at ASC
    `, [discussionId]);

    const sanitizedComments = comments.map(comm => ({
      ...comm,
      username: comm.is_anonymous ? "Anonymous" : comm.username
    }));

    res.json({ success: true, comments: sanitizedComments });
  } catch (err) {
    console.error("GET COMMENTS ERROR:", err);
    res.status(500).json({ success: false, error: "Server error fetching comments", details: err.message });
  }
};

// Create a comment on a discussion
export const createDiscussionComment = async (req, res) => {
  try {
    const { content, isAnonymous } = req.body;
    const { discussionId } = req.params;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const [result] = await pool.query(
      "INSERT INTO discussion_comments (discussion_id, user_id, content, is_anonymous) VALUES (?, ?, ?, ?)",
      [discussionId, userId, content, isAnonymous || false]
    );

    res.json({ success: true, commentId: result.insertId });
  } catch (err) {
    console.error("CREATE COMMENT ERROR:", err);
    res.status(500).json({ success: false, error: "Server error creating comment", details: err.message });
  }
};
