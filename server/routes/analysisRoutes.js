import express from "express";
import groq from "../utils/groq.js";
import { userAuth } from "../middleware/uesrAuth.js";

const router = express.Router();

router.post("/analyze", userAuth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text required" });
    }

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

Message:
${text}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    let aiText = completion.choices[0].message.content;

    const parsed = JSON.parse(aiText);

    return res.json({
      success: true,
      data: parsed,
    });

  } catch (error) {
    console.log("AI error:", error);
    return res.status(500).json({ error: "AI error" });
  }
});

router.post("/analyze-proof", userAuth, async (req, res) => {
  try {
    const { text, proofText } = req.body;

    if (!text || !proofText) {
      return res.status(400).json({ error: "Text and proof required" });
    }

    const prompt = `
You are an AI auditor. A user flagged for a potentially suspicious post has submitted proof to justify it.
Evaluate if the proof makes sense or provides valid justification/context to consider the post safe.

Post Text:
"${text}"

User's Proof:
"${proofText}"

Return ONLY valid JSON (no markdown, no backticks):

{
  "valid": true | false,
  "reason": "Brief reason why"
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    let aiText = completion.choices[0].message.content;
    const parsed = JSON.parse(aiText);

    return res.json({
      success: true,
      valid: parsed.valid,
      reason: parsed.reason
    });
  } catch (error) {
    console.log("Analyze proof error:", error);
    return res.status(500).json({ error: "AI error" });
  }
});

export default router;