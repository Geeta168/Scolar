import groq from "../utils/groq.js";
import pool from "../db.js";

export const createPost = async (req, res) => {
  console.log("USER FROM AUTH:", req.user);

  try {
    // 🔴 FIX 1: prevent 500 crash
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user_Id = req.user.userId;
    console.log("USER ID:", user_Id);
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text required" });
    }

    // 1️⃣ AI PROMPT (UNCHANGED - as you requested)
    const prompt = `
You are a scam detection AI.

Return ONLY valid JSON (no markdown, no backticks):

{
  "score": number (0-100),
  "label": "SAFE" | "SUSPICIOUS" | "SCAM",
  "reasons": ["reason1", "reason2"]
}

return reasons properly based on the text analysis. Do not return generic reasons. Analyze the text deeply and provide specific reasons for the assigned label.

Important:
- Do NOT give high score for meaningless messages

Text:
${text}
`;

    // 2️⃣ CALL AI
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const aiText = completion.choices[0].message.content;

    let aiResult;

    // 🔴 FIX 2: safe JSON parsing
    try {
      aiResult = JSON.parse(aiText);
    } catch (err) {
      console.log("AI RAW OUTPUT:", aiText);
      return res.status(500).json({ error: "AI response invalid JSON" });
    }

    // 🔴 FIX 3: SCAM FLAG LOGIC
    const isFlagged =
      aiResult.label === "SCAM" || aiResult.score < 30;

    // 3️⃣ SAVE TO MYSQL
    const [result] = await pool.query(
      `INSERT INTO posts 
      (user_id, content, ai_score, ai_label, flag_count, is_flagged)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user_Id,
        text,
        aiResult.score,
        aiResult.label,
        isFlagged ? 1 : 0,
        isFlagged ? 1 : 0
      ]
    );

    // 4️⃣ RESPONSE
    return res.json({
      success: true,
      postId: result.insertId,
      ai: aiResult
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
        posts.post_id,
        posts.user_id,
        posts.content,
        posts.ai_score,
        posts.ai_label,
        posts.created_at,
        users.username,
        COUNT(votes.id) AS votes
      FROM posts
      LEFT JOIN users ON posts.user_id = users.user_id
      LEFT JOIN votes ON posts.post_id = votes.post_id
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