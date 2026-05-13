import pool from "../db.js";
import groq from "../utils/groq.js";

// Fetch chat history for a specific post and user
export const getGuidanceChat = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Bulletproof: ensure table exists before querying!
    await pool.query(`
      CREATE TABLE IF NOT EXISTS guidance_chats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('user', 'ai') NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);

    const [chats] = await pool.query(
      `SELECT role, message, created_at FROM guidance_chats 
       WHERE post_id = ? AND user_id = ? 
       ORDER BY created_at ASC`,
      [postId, userId]
    );

    res.json({ success: true, chats });
  } catch (err) {
    console.error("GET GUIDANCE ERROR:", err);
    res.status(500).json({ error: "Server error fetching guidance chat" });
  }
};

// Send a new message
export const sendGuidanceMessage = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 1. Fetch the post to give context to AI
    const [posts] = await pool.query(
      `SELECT content FROM posts WHERE post_id = ?`,
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    const postContent = posts[0].content;

    // Bulletproof: ensure table exists before querying!
    await pool.query(`
      CREATE TABLE IF NOT EXISTS guidance_chats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('user', 'ai') NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);

    // 2. Insert user message
    await pool.query(
      `INSERT INTO guidance_chats (post_id, user_id, role, message) VALUES (?, ?, ?, ?)`,
      [postId, userId, "user", message]
    );

    // 3. Fetch past context for the LLM
    const [pastChats] = await pool.query(
      `SELECT role, message FROM guidance_chats 
       WHERE post_id = ? AND user_id = ? 
       ORDER BY created_at DESC
       LIMIT 30`, // fetch the newest 20 messages for context
      [postId, userId]
    );

    // Reverse so the oldest of the recent 20 are first, making it chronological for the AI
    const messagesFormatted = pastChats.reverse().map(chat => ({
      role: chat.role === "ai" ? "assistant" : "user",
      content: chat.message
    }));

    const systemPrompt = {
      role: "system",
      content: `You are an AI assistant helping a user understand a scholarship or opportunity post. 
      Analyze the post provided below and answer the user's questions step by step. Keep your answers concise, practical, and helpful. 
      Only provide guidance related to this specific post. Do not provide information outside of this topic.
      if needed browse the web to get the latest information about the post.
      provide working links if needed.
      porvide information in bullet points.   
      Post Content:
      "${postContent}"`
    };

    const groqMessages = [systemPrompt, ...messagesFormatted];

    // 4. Call LLM
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: groqMessages,
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0].message.content;

    // 5. Insert AI response
    await pool.query(
      `INSERT INTO guidance_chats (post_id, user_id, role, message) VALUES (?, ?, ?, ?)`,
      [postId, userId, "ai", aiResponse]
    );

    res.json({ success: true, response: aiResponse });
  } catch (err) {
    console.error("SEND GUIDANCE ERROR:", err);
    res.status(500).json({ error: "Server error sending guidance message" });
  }
};
