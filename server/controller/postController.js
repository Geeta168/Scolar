import groq from "../utils/groq.js";
import pool from "../db.js";

export const createPost = async (req, res) => {
    console.log("USER FROM AUTH:", req.user);
    try {

        const user_Id= req.user.userId;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Text required" });
        }

        // 1️⃣ AI PROMPT
        const prompt = `
You are a scam detection AI.

Return ONLY JSON:
{
  "score": number,
  "label": "SAFE" | "SUSPICIOUS" | "SCAM",
  "reasons": ["reason1", "reason2"]
}

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
        try {
            aiResult = JSON.parse(aiText);
        } catch (err) {
            return res.status(500).json({ error: "AI response invalid" });
        }

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
                0,
                false
            ]
        );

        // 4️⃣ RESPONSE
        res.json({
            success: true,
            postId: result.insertId,
            ai: aiResult
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }
};