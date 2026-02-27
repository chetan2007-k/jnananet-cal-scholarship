const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN;

app.get("/", (req, res) => {
  res.send("HF Backend Running");
});

app.post("/api/guidance", async (req, res) => {
  try {
    const { question, language, literacy } = req.body;

    const literacyInstruction =
      literacy === "Low"
        ? "Explain in very simple words."
        : literacy === "Medium"
        ? "Explain clearly with some detail."
        : "Explain in detailed academic style.";

    const prompt = `
You are JnanaNet, a government scholarship assistant.
Respond in ${language}.
${literacyInstruction}

User Question:
${question}
`;

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/google/flan-t5-large",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data || !response.data[0]) {
      return res.json({ message: "Model loading. Try again in 10 seconds." });
    }

    res.json({ message: response.data[0].generated_text });

  } catch (error) {
    console.error("HF Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Error generating AI response." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});