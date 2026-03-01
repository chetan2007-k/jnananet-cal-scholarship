const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const REGION = process.env.AWS_REGION || "ap-south-1";

const bedrockClient = new BedrockRuntimeClient({ region: REGION });

function buildScholarshipPrompt({ question, language, literacy }) {
  const literacyInstruction =
    literacy === "Low"
      ? "Use very simple words, short lines, and practical steps."
      : literacy === "Medium"
        ? "Use clear and friendly explanation with structured steps."
        : "Provide a detailed and well-structured explanation.";

  return `You are JnanaNet, an AI scholarship assistant for Indian students.

Response language: ${language || "English"}
Literacy level: ${literacy || "Medium"}
Style instruction: ${literacyInstruction}

Student question:
${question}

Answer with:
1) direct answer,
2) relevant scholarship tips,
3) required documents/checklist,
4) next best action.
Keep response practical and accurate for Indian scholarship workflows.`;
}

function buildModelBody(prompt, modelId) {
  if (modelId.includes("anthropic")) {
    return {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 700,
      temperature: 0.5,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }],
        },
      ],
    };
  }

  return {
    inputText: prompt,
    textGenerationConfig: {
      maxTokenCount: 700,
      temperature: 0.5,
    },
  };
}

function extractMessage(result, modelId) {
  if (modelId.includes("anthropic")) {
    return result?.content?.[0]?.text || "No response";
  }

  if (Array.isArray(result?.results)) {
    return result.results[0]?.outputText || "No response";
  }

  return result?.outputText || result?.generation || "No response";
}

async function generateGuidance({ question, language, literacy }) {
  const modelId = process.env.MODEL_ID;

  if (!modelId) {
    throw new Error("MODEL_ID is not configured");
  }

  const prompt = buildScholarshipPrompt({ question, language, literacy });
  const requestBody = buildModelBody(prompt, modelId);

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(requestBody),
  });

  const response = await bedrockClient.send(command);
  const raw = new TextDecoder().decode(response.body);
  const parsed = JSON.parse(raw);

  return extractMessage(parsed, modelId);
}

module.exports = {
  generateGuidance,
};