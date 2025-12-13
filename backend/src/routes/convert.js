const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

router.post("/", async (req, res) => {
  const { sourceCode, targetLanguage } = req.body;


  const prompt = `
Convert the following code to ${targetLanguage}. 
Return ONLY the converted code without explanation.

Input:
${sourceCode}
`;

  try {
    const result = await model.generateContent(prompt);
   console.log("Full Gemini Response Object:", JSON.stringify(result, null, 2));
    const output = result.response.candidates[0].content.parts[0].text;
    console.log("output:   "+output)
    res.json({ convertedCode: output });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Conversion failed" });
  }
});

module.exports = router;
