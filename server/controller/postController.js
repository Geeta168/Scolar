import groq from "../utils/groq.js";
import pool from "../db.js";

export const createPost = async (req, res) => {
  console.log("USER FROM AUTH:", req.user);

  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user_Id = req.user.userId;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text required" });
    }

    // Save post without requiring AI analysis - simpler flow
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
    return res.status(500).json({ error: "Server error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const [posts] = await pool.query(`
      SELECT 
        posts.post_id AS id,
        posts.user_id,
        posts.content,
        posts.ai_score,
        posts.ai_label,
        posts.created_at,
        posts.is_flagged,
        users.username,
        SUM(CASE WHEN votes.vote_type = 'upvote' OR votes.vote_type IS NULL THEN 1 ELSE 0 END) AS upvotes,
        SUM(CASE WHEN votes.vote_type = 'downvote' THEN 1 ELSE 0 END) AS downvotes,
        COUNT(DISTINCT comments.id) AS commentCount
      FROM posts
      LEFT JOIN users ON posts.user_id = users.user_id
      LEFT JOIN votes ON posts.post_id = votes.post_id
      LEFT JOIN comments ON posts.post_id = comments.post_id
      GROUP BY posts.post_id
      ORDER BY posts.created_at DESC
    `);

    res.json({
      success: true,
      posts
    });

  } catch (err) {
    console.log("GET POSTS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Analyze post scam risk based on engagement metrics
export const analyzePostScam = async (req, res) => {
  try {
    const { postId } = req.params;

    const [postData] = await pool.query(`
      SELECT 
        posts.content,
        posts.post_id AS id,
        SUM(CASE WHEN votes.vote_type = 'upvote' OR votes.vote_type IS NULL THEN 1 ELSE 0 END) AS upvotes,
        SUM(CASE WHEN votes.vote_type = 'downvote' THEN 1 ELSE 0 END) AS downvotes,
        COUNT(DISTINCT comments.id) AS commentCount,
        GROUP_CONCAT(comments.content) AS commentTexts
      FROM posts
      LEFT JOIN votes ON posts.post_id = votes.post_id
      LEFT JOIN comments ON posts.post_id = comments.post_id
      WHERE posts.post_id = ?
      GROUP BY posts.post_id
    `, [postId]);

    if (!postData.length) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const post = postData[0];
    const upvotes = post.upvotes || 0;
    const downvotes = post.downvotes || 0;
    const commentCount = post.commentCount || 0;
    const totalVotes = upvotes + downvotes;
    
    // Calculate engagement-based scam metrics
    let scamScore = 50; // baseline
    let reasons = [];

    // Downvote ratio analysis
    if (totalVotes > 0) {
      const downvoteRatio = downvotes / totalVotes;
      if (downvoteRatio > 0.5) {
        scamScore += 25;
        reasons.push(`High downvote ratio (${(downvoteRatio * 100).toFixed(1)}%)`);
      } else if (downvoteRatio > 0.3) {
        scamScore += 10;
        reasons.push(`Moderate downvote ratio (${(downvoteRatio * 100).toFixed(1)}%)`);
      }
    }

    // Low engagement analysis
    if (totalVotes < 3 && commentCount < 2) {
      scamScore += 15;
      reasons.push("Low engagement (few votes and comments)");
    }

    // High engagement = trustworthy
    if (upvotes > 5 && downvotes < 2) {
      scamScore -= 15;
      reasons.push("Strong positive engagement");
    }

    // AI analysis of comments for red flags
    if (post.commentTexts) {
      const commentArray = post.commentTexts.split(",");
      const negativeKeywords = ["scam", "fake", "fraud", "suspicious", "warning", "beware"];
      let negativeCount = 0;
      
      commentArray.forEach(comment => {
        const lower = comment.toLowerCase();
        negativeKeywords.forEach(kw => {
          if (lower.includes(kw)) negativeCount++;
        });
      });

      if (negativeCount > 2) {
        scamScore += 20;
        reasons.push(`Multiple negative mentions in comments (${negativeCount})`);
      }
    }

    // Determine label based on final score
    let label = "SAFE";
    if (scamScore > 70) {
      label = "SCAM";
    } else if (scamScore > 50) {
      label = "SUSPICIOUS";
    }

    res.json({
      success: true,
      scamScore: Math.min(100, Math.max(0, scamScore)),
      label,
      reasons,
      metrics: {
        upvotes,
        downvotes,
        comments: commentCount,
        totalEngagement: totalVotes + commentCount
      }
    });

  } catch (err) {
    console.log("ANALYZE SCAM ERROR:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
