const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });



// Add this new route for autocompletion
router.post("/", async (req, res) => {
  console.log("automcompletions")
  try {
    const { sourceCode, targetLanguage } = req.body;

    const prompt = `
      You are a code completion assistant for ${targetLanguage}. 
      Provide 5 short, relevant code completions for the following code snippet.
      Return ONLY a JSON array of strings. Do not include markdown formatting or explanations.
      
      Code:
      ${sourceCode}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
     console.log("output:   "+responseText)
    // Parse the JSON array from Gemini's response
    const suggestions = JSON.parse(responseText.replace(/```json|```/g, "").trim());
    // console.log("suggestion...."+suggestions)
    
    res.json({ auto_suggestions:responseText });
    // console.log("output suggestions : output is..............   "+res.json({ auto_suggestions:suggestions }))

  } catch (error) {
    console.error("Gemini Autocomplete Error:", error);
    res.status(500).json({ suggestions: [] });
  }
});

module.exports = router;
