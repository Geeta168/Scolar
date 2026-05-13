import groq from "../utils/groq.js";
import pool from "../db.js";

export const createPost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const user_Id = req.user.userId;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: "Text required" });
    }

    // Save post without requiring AI analysis
    const [result] = await pool.query(
      `INSERT INTO posts 
      (user_id, content, ai_score, ai_label, flag_count, is_flagged)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [user_Id, text, 50, "PENDING", 0, 0]
    );

    return res.json({
      success: true,
      postId: result.insertId,
      message: "Post created successfully"
    });

  } catch (err) {
    console.log("CREATE POST ERROR:", err);
    return res.status(500).json({ success: false, error: "Server error", details: err.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    // First get all posts with basic info
    const [posts] = await pool.query(`
      SELECT 
        posts.post_id AS id,
        posts.user_id,
        posts.content,
        posts.ai_score,
        posts.ai_label,
        posts.created_at,
        posts.is_flagged,
        users.username
      FROM posts
      LEFT JOIN users ON posts.user_id = users.user_id
      ORDER BY posts.created_at DESC
    `);

    // Get vote counts for all posts
    const [voteCounts] = await pool.query(`
      SELECT 
        post_id,
        SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END) AS upvotes,
        SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END) AS downvotes
      FROM votes
      GROUP BY post_id
    `);

    // Get comment counts for all posts
    const [commentCounts] = await pool.query(`
      SELECT 
        post_id,
        COUNT(*) AS commentCount
      FROM comments
      GROUP BY post_id
    `);

    // Merge vote and comment data
    const voteMap = {};
    voteCounts.forEach(v => {
      voteMap[v.post_id] = {
        upvotes: v.upvotes || 0,
        downvotes: v.downvotes || 0
      };
    });

    const commentMap = {};
    commentCounts.forEach(c => {
      commentMap[c.post_id] = c.commentCount || 0;
    });

    // Add vote and comment data to posts
    const enrichedPosts = posts.map(post => ({
      ...post,
      upvotes: voteMap[post.id]?.upvotes || 0,
      downvotes: voteMap[post.id]?.downvotes || 0,
      commentCount: commentMap[post.id] || 0
    }));

    res.json({
      success: true,
      posts: enrichedPosts
    });

  } catch (err) {
    console.log("GET POSTS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Analyze post scam risk based on engagement metrics and AI content analysis
export const analyzePostScam = async (req, res) => {
  try {
    const { postId } = req.params;

    // Get post content, votes and comments
    const [postData] = await pool.query(`
      SELECT 
        posts.content,
        posts.post_id AS id,
        COALESCE(SUM(CASE WHEN votes.vote_type = 'upvote' THEN 1 ELSE 0 END), 0) AS upvotes,
        COALESCE(SUM(CASE WHEN votes.vote_type = 'downvote' THEN 1 ELSE 0 END), 0) AS downvotes,
        COUNT(DISTINCT comments.comment_id) AS commentCount
      FROM posts
      LEFT JOIN votes ON posts.post_id = votes.post_id
      LEFT JOIN comments ON posts.post_id = comments.post_id
      WHERE posts.post_id = ?
      GROUP BY posts.post_id
    `, [postId]);

    if (!postData.length) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Get comment texts separately to avoid GROUP_CONCAT limits
    const [commentData] = await pool.query(`
      SELECT content FROM comments WHERE post_id = ? LIMIT 10
    `, [postId]);

    const post = postData[0];
    const commentTexts = commentData.map(c => c.content).join("\n- ");
    const upvotes = post.upvotes || 0;
    const downvotes = post.downvotes || 0;

    const prompt = `
      Analyze the following scholarship post and community engagement to determine if it is a SCAM or REAL.
      
      POST CONTENT:
      "${post.content}"
      
      COMMUNITY ENGAGEMENT:
      - Upvotes: ${upvotes}
      - Downvotes: ${downvotes}
      - Recent Comments: 
      ${commentTexts || "No community comments yet."}
      
      INSTRUCTIONS:
      1. Evaluate the content for common scam red flags (vague details, suspicious links, requests for money, too-good-to-be-true promises).
      2. Factor in the community votes. High downvotes compared to upvotes often signal a scam.
      3. Analyze the sentiment of comments. Look for warnings like "scam", "fake", or "worked for me".
      
      Return ONLY a JSON object in this format:
      {
        "label": "SCAM" | "SUSPICIOUS" | "REAL",
        "score": number (0-100, where 100 is definitely a scam),
        "reasoning": "A brief explanation of why this was flagged"
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-specdec",
      response_format: { type: "json_object" },
    });

    const aiResult = JSON.parse(chatCompletion.choices[0].message.content);

    // Update the post with the latest AI results
    await pool.query(
      "UPDATE posts SET ai_score = ?, ai_label = ? WHERE post_id = ?",
      [aiResult.score, aiResult.label, postId]
    );

    res.json({
      success: true,
      ...aiResult,
      metrics: {
        upvotes,
        downvotes,
        comments: post.commentCount
      }
    });

  } catch (err) {
    console.log("ANALYZE SCAM ERROR:", err);
    res.status(500).json({ success: false, error: "Server error", details: err.message });
  }
};
