import pool from "../db.js";
import groq from "../utils/groq.js";

// Fetch chat history for global guidance
export const getGlobalGuidanceChat = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [chats] = await pool.query(
      `SELECT role, message, created_at FROM global_guidance_chats 
       WHERE user_id = ? 
       ORDER BY created_at ASC`,
      [userId]
    );

    res.json({ success: true, chats });
  } catch (err) {
    console.error("GET GLOBAL GUIDANCE ERROR:", err);
    res.status(500).json({ error: "Server error fetching global guidance chat" });
  }
};

// Send a new global guidance message
export const sendGlobalGuidanceMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Insert user message
    await pool.query(
      `INSERT INTO global_guidance_chats (user_id, role, message) VALUES (?, ?, ?)`,
      [userId, "user", message]
    );

    // Fetch past context for the LLM
    const [pastChats] = await pool.query(
      `SELECT role, message FROM global_guidance_chats 
       WHERE user_id = ? 
       ORDER BY created_at ASC
       LIMIT 15`, // fetch last 15 for context
      [userId]
    );

    const messagesFormatted = pastChats.map(chat => ({
      role: chat.role === "ai" ? "assistant" : "user",
      content: chat.message
    }));

    const systemPrompt = {
      role: "system",
      content: `You are a highly knowledgeable and supportive AI Mentor for an application called "Scolar", which helps users find and verify scholarships. 
      Guide the user step-by-step on how to search for scholarships, how to verify if a scholarship is safe, or any other query they have regarding scholarship readiness. 
      Provide practical, concise, and friendly advice.`
    };

    const groqMessages = [systemPrompt, ...messagesFormatted];

    // Call LLM
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: groqMessages,
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0].message.content;

    // Insert AI response
    await pool.query(
      `INSERT INTO global_guidance_chats (user_id, role, message) VALUES (?, ?, ?)`,
      [userId, "ai", aiResponse]
    );

    res.json({ success: true, response: aiResponse });
  } catch (err) {
    console.error("SEND GLOBAL GUIDANCE ERROR:", err);
    res.status(500).json({ error: "Server error sending global guidance message" });
  }
};
